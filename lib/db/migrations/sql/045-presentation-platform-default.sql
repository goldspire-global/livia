-- Reset all tenants to Constellation (platform-default) until owners pick Appearance.
UPDATE businesses
SET presentation_preset_id = 'platform-default'
WHERE presentation_preset_id IS DISTINCT FROM 'platform-default';
