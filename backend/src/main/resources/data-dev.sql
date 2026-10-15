INSERT INTO NH_ROOM_TYPES (ROOM_TYPE_ID, NAME, SLUG, DESCRIPTION, BASE_PRICE, MAX_GUESTS, IS_ACTIVE)
VALUES (1, 'Garden Room', 'garden-room', 'A calm, light-filled room opening onto green.', 5200.00, 2, TRUE);
INSERT INTO NH_ROOM_TYPES (ROOM_TYPE_ID, NAME, SLUG, DESCRIPTION, BASE_PRICE, MAX_GUESTS, IS_ACTIVE)
VALUES (2, 'Courtyard Villa', 'courtyard-villa', 'A private villa with a generous courtyard and long, easy evenings.', 9800.00, 4, TRUE);
INSERT INTO NH_ROOM_TYPES (ROOM_TYPE_ID, NAME, SLUG, DESCRIPTION, BASE_PRICE, MAX_GUESTS, IS_ACTIVE)
VALUES (3, 'Terrace Suite', 'terrace-suite', 'A spacious suite with a private terrace and soft sea light.', 7400.00, 3, TRUE);

INSERT INTO NH_ROOMS (ROOM_ID, ROOM_CODE, DISPLAY_NAME, ROOM_TYPE_ID, STATUS, FLOOR_LABEL, IS_FEATURED, IMAGE_URL, SIZE_SQFT, PRICE_OVERRIDE)
VALUES (1, 'NH-G01', 'The Garden Room', 1, 'ACTIVE', 'Ground floor', TRUE, 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80', 380, NULL);
INSERT INTO NH_ROOMS (ROOM_ID, ROOM_CODE, DISPLAY_NAME, ROOM_TYPE_ID, STATUS, FLOOR_LABEL, IS_FEATURED, IMAGE_URL, SIZE_SQFT, PRICE_OVERRIDE)
VALUES (2, 'NH-C02', 'The Courtyard Villa', 2, 'ACTIVE', 'Ground floor', TRUE, 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80', 760, NULL);
INSERT INTO NH_ROOMS (ROOM_ID, ROOM_CODE, DISPLAY_NAME, ROOM_TYPE_ID, STATUS, FLOOR_LABEL, IS_FEATURED, IMAGE_URL, SIZE_SQFT, PRICE_OVERRIDE)
VALUES (3, 'NH-T03', 'The Terrace Suite', 3, 'ACTIVE', 'First floor', TRUE, 'https://images.unsplash.com/photo-1615874694520-474822394e73?auto=format&fit=crop&w=1200&q=80', 540, NULL);
INSERT INTO NH_ROOMS (ROOM_ID, ROOM_CODE, DISPLAY_NAME, ROOM_TYPE_ID, STATUS, FLOOR_LABEL, IS_FEATURED, IMAGE_URL, SIZE_SQFT, PRICE_OVERRIDE)
VALUES (4, 'NH-G04', 'The Verandah Room', 1, 'ACTIVE', 'Ground floor', FALSE, 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80', 360, NULL);

-- Do not seed a known password in source control. Provision a local admin
-- through a secure, environment-specific setup process instead.