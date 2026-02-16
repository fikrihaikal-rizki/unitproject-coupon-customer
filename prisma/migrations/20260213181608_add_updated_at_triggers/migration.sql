
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_customer_modtime
    BEFORE UPDATE ON customers
    FOR EACH ROW
    EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_event_modtime
    BEFORE UPDATE ON events
    FOR EACH ROW
    EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_registration_step_modtime
    BEFORE UPDATE ON registration_steps
    FOR EACH ROW
    EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_questionnaire_question_modtime
    BEFORE UPDATE ON questionnaire_questions
    FOR EACH ROW
    EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_claim_seat_config_modtime
    BEFORE UPDATE ON claim_seat_configs
    FOR EACH ROW
    EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_event_registration_modtime
    BEFORE UPDATE ON event_registrations
    FOR EACH ROW
    EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_claim_seat_error_modtime
    BEFORE UPDATE ON claim_seat_errors
    FOR EACH ROW
    EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_admin_modtime
    BEFORE UPDATE ON administrators
    FOR EACH ROW
    EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_event_coupon_modtime
    BEFORE UPDATE ON event_coupons
    FOR EACH ROW
    EXECUTE PROCEDURE update_modified_column();