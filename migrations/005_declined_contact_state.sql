ALTER TABLE citta.messages DROP CONSTRAINT messages_contact_state_check;
ALTER TABLE citta.messages ADD CONSTRAINT messages_contact_state_check
 CHECK(contact_state IN ('created','delivered','seen','answered','deferred','declined','expired'));
UPDATE citta.messages m SET contact_state='declined'
 FROM citta.contacts c WHERE m.contact_id=c.id AND m.agent_id=c.agent_id AND c.state='declined';
