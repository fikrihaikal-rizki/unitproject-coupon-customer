-- 1. Buat Function Utama (Hanya perlu dibuat satu kali) [cite: 2]
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 2. Trigger untuk tabel customers [cite: 2]
CREATE TRIGGER update_customers_modtime
BEFORE UPDATE ON customers
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 3. Trigger untuk tabel registration_steps [cite: 7]
CREATE TRIGGER update_registration_steps_timestamp
BEFORE UPDATE ON registration_steps
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 4. Trigger untuk tabel questionnaire_questions [cite: 11]
CREATE TRIGGER update_questionnaire_questions_timestamp
BEFORE UPDATE ON questionnaire_questions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 5. Trigger untuk tabel claim_seat_configs [cite: 15]
CREATE TRIGGER update_claim_seat_configs_timestamp
BEFORE UPDATE ON claim_seat_configs
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();