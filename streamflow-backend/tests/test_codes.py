import string

from app.utils.codes import generate_recovery_codes, hash_code, verify_code


class TestRecoveryCodeGeneration:
    def test_generate_recovery_codes_default(self):
        """Test generating recovery codes with default parameters."""
        codes = generate_recovery_codes()

        assert len(codes) == 5  # Default count
        for code in codes:
            assert len(code) == 12  # Default length
            assert code.isalnum()  # Only alphanumeric
            assert code.isupper()  # Only uppercase

    def test_generate_recovery_codes_custom_count(self):
        """Test generating recovery codes with custom count."""
        codes = generate_recovery_codes(count=3)

        assert len(codes) == 3
        for code in codes:
            assert len(code) == 12

    def test_generate_recovery_codes_custom_length(self):
        """Test generating recovery codes with custom length."""
        codes = generate_recovery_codes(length=8)

        assert len(codes) == 5
        for code in codes:
            assert len(code) == 8

    def test_generate_recovery_codes_uniqueness(self):
        """Test that generated codes are unique."""
        codes = generate_recovery_codes(count=10)

        assert len(codes) == 10
        assert len(set(codes)) == 10  # All unique

    def test_generate_recovery_codes_character_set(self):
        """Test that codes only contain valid characters."""
        codes = generate_recovery_codes(count=20)

        valid_chars = set(string.ascii_uppercase + string.digits)

        for code in codes:
            for char in code:
                assert char in valid_chars


class TestRecoveryCodeHashing:
    def test_hash_code(self):
        """Test code hashing."""
        code = "ABC123DEF456"
        hashed = hash_code(code)

        assert hashed != code
        assert len(hashed) > 0
        assert "$2b$" in hashed  # bcrypt prefix

    def test_verify_code_correct(self):
        """Test code verification with correct code."""
        code = "ABC123DEF456"
        hashed = hash_code(code)

        assert verify_code(code, hashed) is True

    def test_verify_code_incorrect(self):
        """Test code verification with incorrect code."""
        code = "ABC123DEF456"
        wrong_code = "XYZ789UVW123"
        hashed = hash_code(code)

        assert verify_code(wrong_code, hashed) is False

    def test_verify_code_case_sensitive(self):
        """Test that code verification is case sensitive."""
        code = "ABC123DEF456"
        lower_code = "abc123def456"
        hashed = hash_code(code)

        assert verify_code(lower_code, hashed) is False

    def test_verify_code_empty(self):
        """Test code verification with empty code."""
        code = "ABC123DEF456"
        hashed = hash_code(code)

        assert verify_code("", hashed) is False

    def test_hash_consistency(self):
        """Test that hashing the same code multiple times gives different hashes."""
        code = "ABC123DEF456"
        hash1 = hash_code(code)
        hash2 = hash_code(code)

        assert hash1 != hash2  # bcrypt adds random salt
        assert verify_code(code, hash1) is True
        assert verify_code(code, hash2) is True
