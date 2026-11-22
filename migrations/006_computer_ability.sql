-- Additive ability extension. Preserve all existing actions and outcomes.
ALTER TABLE citta.actions DROP CONSTRAINT actions_kind_check;
ALTER TABLE citta.actions ADD CONSTRAINT actions_kind_check
  CHECK (kind IN ('INFER','CONSULT_AI','READ','COMPUTER'));
