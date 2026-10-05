// ==============================================================================
// GovPulse Autonomous Digital Government Platform
// Hyperledger Fabric v2.5 Smart Contract (Go Chaincode)
// Reference: 06_DATA_SCHEMAS_AND_LEDGER_DATA_MODEL.md (Section 2)
// Channel: cert-registry
// Endorsement Policy: OutOf(2, RevenueDeptMSP, DITDeptMSP) AND AntiCorruptionBureauMSP
// ==============================================================================

package main

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"time"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

// CertificateState represents the on-chain immutable proof commitment
type CertificateState struct {
	CertificateID        string    `json:"certificate_id"`        // "GOV-2026-INC-883921"
	CertificateType      string    `json:"certificate_type"`      // "INCOME_AND_ASSET"
	StateHash            string    `json:"state_hash"`            // SHA-256(CertID || DocHash || Sig || Time)
	DocumentSHA256       string    `json:"document_sha256"`       // Client-side raw doc hash
	CitizenIdentityHash  string    `json:"citizen_identity_hash"` // SHA-256(NationalID) - Zero PII
	IssuerOfficerID      string    `json:"issuer_officer_id"`     // "OFFICER-REV-4091"
	IssuerPKIFingerprint string    `json:"issuer_pki_fingerprint"`// SHA-256(Officer X.509 Cert)
	OfficerDigitalSig    string    `json:"officer_digital_sig"`   // ECDSA Base64 Signature
	Status               string    `json:"status"`                // "VALID" or "REVOKED"
	IssuedTimestamp      time.Time `json:"issued_timestamp"`
	BlockNumber          uint64    `json:"block_number"`
	MerkleRoot           string    `json:"merkle_root"`
}

// CertificateRevocationEvent logs immutable revocation
type CertificateRevocationEvent struct {
	CertificateID     string    `json:"certificate_id"`
	RevokedByOfficer  string    `json:"revoked_by_officer"`
	RevocationReason  string    `json:"revocation_reason"`
	StatutoryCitation string    `json:"statutory_citation"`
	Timestamp         time.Time `json:"timestamp"`
	Signature         string    `json:"signature"`
}

// SmartContract provides functions for managing state certificates and revocations
type SmartContract struct {
	contractapi.Contract
}

// ComputeStateHash calculates H_state = SHA-256(CertID || DocHash || Sig || Time)
func ComputeStateHash(certID, docHash, sig string, timestamp time.Time) string {
	payload := fmt.Sprintf("%s:%s:%s:%s", certID, docHash, sig, timestamp.Format(time.RFC3339))
	hash := sha256.Sum256([]byte(payload))
	return hex.EncodeToString(hash[:])
}

// InitLedger adds sample genesis state certificates
func (s *SmartContract) InitLedger(ctx contractapi.TransactionContextInterface) error {
	now := time.Now().UTC()
	initCerts := []CertificateState{
		{
			CertificateID:        "GOV-2026-INC-883921",
			CertificateType:      "INCOME_AND_ASSET",
			DocumentSHA256:       "4a5c6e8d1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c",
			CitizenIdentityHash:  "999911112222_aadhaar_sha256_pune_hash",
			IssuerOfficerID:      "OFF-NT-HAVELI-01",
			IssuerPKIFingerprint: "sha256_x509_cert_haveli_pki_01",
			OfficerDigitalSig:    "3045022100d3b8e9f1a2c3b4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9",
			Status:               "VALID",
			IssuedTimestamp:      now,
			BlockNumber:          104829,
			MerkleRoot:           "merkle_root_block_104829",
		},
	}

	for _, cert := range initCerts {
		cert.StateHash = ComputeStateHash(cert.CertificateID, cert.DocumentSHA256, cert.OfficerDigitalSig, cert.IssuedTimestamp)
		certJSON, err := json.Marshal(cert)
		if err != nil {
			return err
		}
		err = ctx.GetStub().PutState(cert.CertificateID, certJSON)
		if err != nil {
			return fmt.Errorf("failed to put certificate to world state: %v", err)
		}
	}

	return nil
}

// IssueCertificate mints a new verifiable credential state on the ledger
func (s *SmartContract) IssueCertificate(
	ctx contractapi.TransactionContextInterface,
	certID string,
	certType string,
	docSHA256 string,
	citizenHash string,
	issuerOfficerID string,
	pkiFingerprint string,
	officerSig string,
	blockNumber uint64,
	merkleRoot string,
) error {
	exists, err := ctx.GetStub().GetState(certID)
	if err != nil {
		return fmt.Errorf("failed to read from world state: %v", err)
	}
	if exists != nil {
		return fmt.Errorf("the certificate %s already exists", certID)
	}

	now := time.Now().UTC()
	stateHash := ComputeStateHash(certID, docSHA256, officerSig, now)

	cert := CertificateState{
		CertificateID:        certID,
		CertificateType:      certType,
		StateHash:            stateHash,
		DocumentSHA256:       docSHA256,
		CitizenIdentityHash:  citizenHash,
		IssuerOfficerID:      issuerOfficerID,
		IssuerPKIFingerprint: pkiFingerprint,
		OfficerDigitalSig:    officerSig,
		Status:               "VALID",
		IssuedTimestamp:      now,
		BlockNumber:          blockNumber,
		MerkleRoot:           merkleRoot,
	}

	certJSON, err := json.Marshal(cert)
	if err != nil {
		return err
	}

	return ctx.GetStub().PutState(certID, certJSON)
}

// RevokeCertificate marks a certificate as REVOKED and writes an immutable CertificateRevocationEvent
func (s *SmartContract) RevokeCertificate(
	ctx contractapi.TransactionContextInterface,
	certID string,
	revokedBy string,
	reason string,
	statutoryCitation string,
	signature string,
) error {
	certBytes, err := ctx.GetStub().GetState(certID)
	if err != nil {
		return fmt.Errorf("failed to read from world state: %v", err)
	}
	if certBytes == nil {
		return fmt.Errorf("the certificate %s does not exist", certID)
	}

	var cert CertificateState
	err = json.Unmarshal(certBytes, &cert)
	if err != nil {
		return err
	}

	if cert.Status == "REVOKED" {
		return fmt.Errorf("certificate %s is already revoked", certID)
	}

	// 1. Update Certificate Status
	cert.Status = "REVOKED"
	updatedCertJSON, err := json.Marshal(cert)
	if err != nil {
		return err
	}
	err = ctx.GetStub().PutState(certID, updatedCertJSON)
	if err != nil {
		return err
	}

	// 2. Append CertificateRevocationEvent composite key
	now := time.Now().UTC()
	revocationEvent := CertificateRevocationEvent{
		CertificateID:     certID,
		RevokedByOfficer:  revokedBy,
		RevocationReason:  reason,
		StatutoryCitation: statutoryCitation,
		Timestamp:         now,
		Signature:         signature,
	}

	eventJSON, err := json.Marshal(revocationEvent)
	if err != nil {
		return err
	}

	compositeKey, err := ctx.GetStub().CreateCompositeKey("revocation~cert", []string{certID, now.Format(time.RFC3339)})
	if err != nil {
		return err
	}

	return ctx.GetStub().PutState(compositeKey, eventJSON)
}

// QueryCertificate retrieves a certificate by ID from CouchDB World State
func (s *SmartContract) QueryCertificate(ctx contractapi.TransactionContextInterface, certID string) (*CertificateState, error) {
	certBytes, err := ctx.GetStub().GetState(certID)
	if err != nil {
		return nil, fmt.Errorf("failed to read world state: %v", err)
	}
	if certBytes == nil {
		return nil, fmt.Errorf("certificate %s not found", certID)
	}

	var cert CertificateState
	err = json.Unmarshal(certBytes, &cert)
	if err != nil {
		return nil, err
	}

	return &cert, nil
}

func main() {
	chaincode, err := contractapi.NewChaincode(&SmartContract{})
	if err != nil {
		fmt.Printf("Error creating cert-registry chaincode: %s", err.Error())
		return
	}

	if err := chaincode.Start(); err != nil {
		fmt.Printf("Error starting cert-registry chaincode: %s", err.Error())
	}
}
