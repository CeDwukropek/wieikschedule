SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- \restrict Bn8umUfwkRUlWHEdtdjh88NLELWCAhFhSsaTYnuUftQe9zH2qRAcDSh3xjpbbGT

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."audit_log_entries" ("instance_id", "id", "payload", "created_at", "ip_address") FROM stdin;
\.


--
-- Data for Name: custom_oauth_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."custom_oauth_providers" ("id", "provider_type", "identifier", "name", "client_id", "client_secret", "acceptable_client_ids", "scopes", "pkce_enabled", "attribute_mapping", "authorization_params", "enabled", "email_optional", "issuer", "discovery_url", "skip_nonce_check", "cached_discovery", "discovery_cached_at", "authorization_url", "token_url", "userinfo_url", "jwks_uri", "created_at", "updated_at", "custom_claims_allowlist") FROM stdin;
\.


--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."flow_state" ("id", "user_id", "auth_code", "code_challenge_method", "code_challenge", "provider_type", "provider_access_token", "provider_refresh_token", "created_at", "updated_at", "authentication_method", "auth_code_issued_at", "invite_token", "referrer", "oauth_client_state_id", "linking_target_id", "email_optional") FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."users" ("instance_id", "id", "aud", "role", "email", "encrypted_password", "email_confirmed_at", "invited_at", "confirmation_token", "confirmation_sent_at", "recovery_token", "recovery_sent_at", "email_change_token_new", "email_change", "email_change_sent_at", "last_sign_in_at", "raw_app_meta_data", "raw_user_meta_data", "is_super_admin", "created_at", "updated_at", "phone", "phone_confirmed_at", "phone_change", "phone_change_token", "phone_change_sent_at", "email_change_token_current", "email_change_confirm_status", "banned_until", "reauthentication_token", "reauthentication_sent_at", "is_sso_user", "deleted_at", "is_anonymous") FROM stdin;
\.


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."identities" ("provider_id", "user_id", "identity_data", "provider", "last_sign_in_at", "created_at", "updated_at", "id") FROM stdin;
\.


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."instances" ("id", "uuid", "raw_base_config", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: oauth_clients; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."oauth_clients" ("id", "client_secret_hash", "registration_type", "redirect_uris", "grant_types", "client_name", "client_uri", "logo_uri", "created_at", "updated_at", "deleted_at", "client_type", "token_endpoint_auth_method") FROM stdin;
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."sessions" ("id", "user_id", "created_at", "updated_at", "factor_id", "aal", "not_after", "refreshed_at", "user_agent", "ip", "tag", "oauth_client_id", "refresh_token_hmac_key", "refresh_token_counter", "scopes") FROM stdin;
\.


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."mfa_amr_claims" ("session_id", "created_at", "updated_at", "authentication_method", "id") FROM stdin;
\.


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."mfa_factors" ("id", "user_id", "friendly_name", "factor_type", "status", "created_at", "updated_at", "secret", "phone", "last_challenged_at", "web_authn_credential", "web_authn_aaguid", "last_webauthn_challenge_data") FROM stdin;
\.


--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."mfa_challenges" ("id", "factor_id", "created_at", "verified_at", "ip_address", "otp_code", "web_authn_session_data") FROM stdin;
\.


--
-- Data for Name: oauth_authorizations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."oauth_authorizations" ("id", "authorization_id", "client_id", "user_id", "redirect_uri", "scope", "state", "resource", "code_challenge", "code_challenge_method", "response_type", "status", "authorization_code", "created_at", "expires_at", "approved_at", "nonce") FROM stdin;
\.


--
-- Data for Name: oauth_client_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."oauth_client_states" ("id", "provider_type", "code_verifier", "created_at") FROM stdin;
\.


--
-- Data for Name: oauth_consents; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."oauth_consents" ("id", "user_id", "client_id", "scopes", "granted_at", "revoked_at") FROM stdin;
\.


--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."one_time_tokens" ("id", "user_id", "token_type", "token_hash", "relates_to", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."refresh_tokens" ("instance_id", "id", "token", "user_id", "revoked", "created_at", "updated_at", "parent", "session_id") FROM stdin;
\.


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."sso_providers" ("id", "resource_id", "created_at", "updated_at", "disabled") FROM stdin;
\.


--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."saml_providers" ("id", "sso_provider_id", "entity_id", "metadata_xml", "metadata_url", "attribute_mapping", "created_at", "updated_at", "name_id_format") FROM stdin;
\.


--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."saml_relay_states" ("id", "sso_provider_id", "request_id", "for_email", "redirect_to", "created_at", "updated_at", "flow_state_id") FROM stdin;
\.


--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."sso_domains" ("id", "sso_provider_id", "domain", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: webauthn_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."webauthn_challenges" ("id", "user_id", "challenge_type", "session_data", "created_at", "expires_at") FROM stdin;
\.


--
-- Data for Name: webauthn_credentials; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."webauthn_credentials" ("id", "user_id", "credential_id", "public_key", "attestation_type", "aaguid", "sign_count", "transports", "backup_eligible", "backed_up", "friendly_name", "created_at", "updated_at", "last_used_at") FROM stdin;
\.


--
-- Data for Name: events; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."events" ("id", "faculty", "date", "start_time", "duration_min", "subject", "instructor", "room", "group", "type", "status") FROM stdin;
36264e0a-fe08-4b41-bf35-b33592f4f1c8	AwP4.0s1	2026-02-25	16:15:00	90	HMI i SCADA w Przemyśle 4.0	mgr inż. M. Worwa	WA2	L1	laboratoria	aktywne
b9239a31-4008-49cb-967c-35b3af373dc4	AwP4.0s1	2026-02-25	18:00:00	90	Programowanie obiektowe	dr inż. R. Rucki	A1	W	wykład	aktywne
ddeaef5b-aef0-4688-87fc-9e33850ac259	AwP4.0s1	2026-02-26	09:15:00	90	Zaawansowane metody identyfikacji układów automatyki	dr inż. M. Orkisz	201	Lk1 / P1	laboratoria	aktywne
6041e1dc-aaf4-4a9f-a3d3-6682fbfdecb9	AwP4.0s1	2026-02-26	11:00:00	90	Zaawansowane metody identyfikacji układów automatyki	dr inż. M. Orkisz	A4	W	wykład	aktywne
dd46ad25-7b8c-46ed-87bc-709fed7baae7	AwP4.0s1	2026-02-26	12:45:00	90	Język angielski	mgr J. Firganek	139SJO	Lek1	laboratoria	aktywne
7f83ac6d-90fb-4a0b-9fcd-a917fb5cf10b	AwP4.0s1	2026-02-26	16:15:00	90	HMI i SCADA w Przemyśle 4.0	prof. R. Sałat	WA2	W	wykład	aktywne
c4799333-d327-46a0-aabd-6fe40e48970b	AwP4.0s1	2026-02-26	18:00:00	90	Programowanie obiektowe	dr inż. R. Rucki	201	Lk1	laboratoria	aktywne
e04af553-81f1-496a-8feb-7817bc031d27	AwP4.0s1	2026-02-27	11:00:00	90	Systemy operacyjne czasu rzeczywistego	dr inż. K. Suchenia	101B	L1	laboratoria	aktywne
580fa0b5-f965-4b5a-857a-998d4eeee5a1	AwP4.0s1	2026-02-27	12:45:00	90	Systemy operacyjne czasu rzeczywistego	dr inż. K. Suchenia	101B	L2	laboratoria	aktywne
1123508d-84ee-4611-ba7e-3e3dc0992255	AwP4.0s1	2026-03-03	14:30:00	90	Komputerowe wspomaganie projektowania	prof. Ł. Ścisło	A4	W	wykład	aktywne
afe228b1-6a52-4c55-bfa2-07f3d8917dc4	AwP4.0s1	2026-03-03	18:00:00	90	Komputerowe wspomaganie projektowania	prof. Ł. Ścisło	11	Lk1	laboratoria	aktywne
0c356ca1-4aa4-4723-b688-c01478abfb50	AwP4.0s1	2026-03-04	16:15:00	90	HMI i SCADA w Przemyśle 4.0	mgr inż. M. Worwa	WA2	L2	laboratoria	aktywne
8559ba85-10dc-4768-9f3e-f8a6edde3872	AwP4.0s1	2026-03-04	18:00:00	90	Programowanie obiektowe	dr inż. R. Rucki	A1	W	wykład	aktywne
19025b2e-7ad6-4632-bda0-c29140634c65	AwP4.0s1	2026-03-05	09:15:00	90	Zaawansowane metody identyfikacji układów automatyki	dr inż. M. Orkisz	201	Lk1 / P1	laboratoria	aktywne
6cdcfe84-9ba6-4b78-8dc3-1641609be4be	AwP4.0s1	2026-03-05	11:00:00	90	Zaawansowane metody identyfikacji układów automatyki	dr inż. M. Orkisz	A4	W	wykład	aktywne
f3089954-64d4-4ed2-8fe6-ca431daa1e89	AwP4.0s1	2026-03-05	12:45:00	90	Język angielski	mgr J. Firganek	139SJO	Lek1	laboratoria	aktywne
fccee3d2-dafd-4ee5-bea8-1901f0d3e553	AwP4.0s1	2026-03-05	18:00:00	90	Programowanie obiektowe	dr inż. R. Rucki	201	Lk1	laboratoria	aktywne
0201c26b-9dcd-4068-a678-2697ff8a0961	AwP4.0s1	2026-03-06	09:15:00	90	Systemy operacyjne czasu rzeczywistego	dr inż. K. Suchenia	A3	W	wykład	aktywne
6d841338-84b9-446c-8d65-c4d0e809f018	AwP4.0s1	2026-03-06	11:00:00	90	Systemy operacyjne czasu rzeczywistego	dr inż. K. Suchenia	101B	L1	laboratoria	aktywne
92f72914-b027-4b6c-8283-155756b9f6f3	AwP4.0s1	2026-03-06	12:45:00	90	Systemy operacyjne czasu rzeczywistego	dr inż. K. Suchenia	101B	L2	laboratoria	aktywne
71390052-7e8f-4a3c-ba87-2c2a7add031f	AwP4.0s1	2026-03-10	18:00:00	90	Komputerowe wspomaganie projektowania	prof. Ł. Ścisło	11	Lk1	laboratoria	aktywne
0e234485-ded6-4153-957f-fb4bb5b5d317	AwP4.0s1	2026-03-11	16:15:00	90	HMI i SCADA w Przemyśle 4.0	mgr inż. M. Worwa	WA2	L1	laboratoria	aktywne
c77319a5-17b9-48a2-ab70-5479c10a1bf5	AwP4.0s1	2026-03-11	18:00:00	90	Programowanie obiektowe	dr inż. R. Rucki	A1	W	wykład	aktywne
f648ab79-375c-4444-8ea6-5038cdb51837	AwP4.0s1	2026-03-12	09:15:00	90	Zaawansowane metody identyfikacji układów automatyki	dr inż. M. Orkisz	201	Lk1 / P1	laboratoria	aktywne
c9af4bfb-3703-40ee-86fc-c74ae804eaad	AwP4.0s1	2026-03-12	11:00:00	90	Zaawansowane metody identyfikacji układów automatyki	dr inż. M. Orkisz	A4	W	wykład	aktywne
2afdf95e-05ab-4f2e-95a0-c483ad588df2	AwP4.0s1	2026-03-12	12:45:00	90	Język angielski	mgr J. Firganek	139SJO	Lek1	laboratoria	aktywne
0832c3d3-d1f3-4fe7-b48e-c6fa69f6874b	AwP4.0s1	2026-03-12	16:15:00	90	HMI i SCADA w Przemyśle 4.0	prof. R. Sałat	WA2	W	wykład	aktywne
4bc375e8-b506-459a-9c55-0f9a020738bc	AwP4.0s1	2026-03-12	18:00:00	90	Programowanie obiektowe	dr inż. R. Rucki	201	Lk1	laboratoria	aktywne
64dc6aca-dc61-426f-95c0-342494c2d428	AwP4.0s1	2026-03-13	11:00:00	90	Systemy operacyjne czasu rzeczywistego	dr inż. K. Suchenia	101B	L1	laboratoria	aktywne
44426739-79bf-420d-9674-9f44a231627b	AwP4.0s1	2026-03-13	12:45:00	90	Systemy operacyjne czasu rzeczywistego	dr inż. K. Suchenia	101B	L2	laboratoria	aktywne
92cbe825-1b54-4452-9cd6-e3ff619c6d27	AwP4.0s1	2026-03-17	14:30:00	90	Komputerowe wspomaganie projektowania	prof. Ł. Ścisło	A4	W	wykład	aktywne
3405aae8-e9b7-4ca1-9505-52632eee66c7	AwP4.0s1	2026-03-17	18:00:00	90	Komputerowe wspomaganie projektowania	prof. Ł. Ścisło	11	Lk1	laboratoria	aktywne
9f61e0db-821d-4897-8f58-c7d2c575aec1	AwP4.0s1	2026-03-18	16:15:00	90	HMI i SCADA w Przemyśle 4.0	mgr inż. M. Worwa	WA2	L2	laboratoria	aktywne
eca31a4d-cc7e-4891-8ab7-60599562270a	AwP4.0s1	2026-03-18	18:00:00	90	Programowanie obiektowe	dr inż. R. Rucki	A1	W	wykład	aktywne
7c53bae9-8da8-48e3-a81e-772f35c45e90	AwP4.0s1	2026-03-19	09:15:00	90	Zaawansowane metody identyfikacji układów automatyki	dr inż. M. Orkisz	201	Lk1 / P1	laboratoria	aktywne
d2af1df8-2790-4c3a-8c0c-148c6a507295	AwP4.0s1	2026-03-19	11:00:00	90	Zaawansowane metody identyfikacji układów automatyki	dr inż. M. Orkisz	A4	W	wykład	aktywne
9749554e-d4b6-4802-97ad-d5fd777c6a28	AwP4.0s1	2026-03-19	12:45:00	90	Język angielski	mgr J. Firganek	139SJO	Lek1	laboratoria	aktywne
af876155-8813-40f3-b1be-01d986afdc17	AwP4.0s1	2026-03-19	18:00:00	90	Programowanie obiektowe	dr inż. R. Rucki	201	Lk1	laboratoria	aktywne
339423ff-f879-43f9-93b0-ced2a33358d2	AwP4.0s1	2026-03-20	09:15:00	90	Systemy operacyjne czasu rzeczywistego	dr inż. K. Suchenia	A3	W	wykład	aktywne
6218a872-ba36-4792-a7a4-265877817928	AwP4.0s1	2026-03-20	11:00:00	90	Systemy operacyjne czasu rzeczywistego	dr inż. K. Suchenia	101B	L1	laboratoria	aktywne
2ffa76d1-6dcc-456a-8c31-30df257fe648	AwP4.0s1	2026-03-20	12:45:00	90	Systemy operacyjne czasu rzeczywistego	dr inż. K. Suchenia	101B	L2	laboratoria	aktywne
6d572387-b267-4cbc-9ec8-c0da6ba372a2	AwP4.0s1	2026-03-24	18:00:00	90	Komputerowe wspomaganie projektowania	prof. Ł. Ścisło	11	Lk1	laboratoria	aktywne
653f20e3-8e65-4e38-9286-4e6200e710d1	AwP4.0s1	2026-03-25	16:15:00	90	HMI i SCADA w Przemyśle 4.0	mgr inż. M. Worwa	WA2	L1	laboratoria	aktywne
5d69055f-f5e1-4ad2-8332-e89a201f019a	AwP4.0s1	2026-03-25	18:00:00	90	Programowanie obiektowe	dr inż. R. Rucki	A1	W	wykład	aktywne
3579be12-9685-493d-8aff-a36ab460f6e6	AwP4.0s1	2026-03-26	09:15:00	90	Zaawansowane metody identyfikacji układów automatyki	dr inż. M. Orkisz	201	Lk1 / P1	laboratoria	aktywne
9b1d9844-d8dd-4c9e-ae94-23881ae52000	AwP4.0s1	2026-03-26	11:00:00	90	Zaawansowane metody identyfikacji układów automatyki	dr inż. M. Orkisz	A4	W	wykład	aktywne
1050afaa-c724-448d-9d10-3097395cafe2	AwP4.0s1	2026-03-26	12:45:00	90	Język angielski	mgr J. Firganek	139SJO	Lek1	laboratoria	aktywne
39cc5b7c-acef-4402-b426-2bcae55cfacf	AwP4.0s1	2026-03-26	16:15:00	90	HMI i SCADA w Przemyśle 4.0	prof. R. Sałat	WA2	W	wykład	aktywne
2feb8f0f-b80d-4338-906e-08561b138b61	AwP4.0s1	2026-03-26	18:00:00	90	Programowanie obiektowe	dr inż. R. Rucki	201	Lk1	laboratoria	aktywne
8114e639-dec2-4985-9f08-a3f0a8c216a9	AwP4.0s1	2026-03-27	11:00:00	90	Systemy operacyjne czasu rzeczywistego	dr inż. K. Suchenia	101B	L1	laboratoria	aktywne
2e23442f-bab3-4280-88de-7b0629e4651a	AwP4.0s1	2026-03-27	12:45:00	90	Systemy operacyjne czasu rzeczywistego	dr inż. K. Suchenia	101B	L2	laboratoria	aktywne
812ae21f-b3bc-448c-9f24-cfceba684f0a	AwP4.0s1	2026-03-31	14:30:00	90	Komputerowe wspomaganie projektowania	prof. Ł. Ścisło	A4	W	wykład	aktywne
ba16564e-943e-4803-854d-8f1fd7c0d027	AwP4.0s1	2026-03-31	18:00:00	90	Komputerowe wspomaganie projektowania	prof. Ł. Ścisło	11	Lk1	laboratoria	aktywne
04f6bf1a-51e9-4a93-b773-5668faedf83d	AwP4.0s1	2026-04-01	07:00:00	900	Przerwa świąteczna	Brak	-	Wszystkie grupy	święto	wolne
2d24070f-086e-4a34-9df1-c50c3615a048	AwP4.0s1	2026-04-02	07:00:00	900	Przerwa świąteczna	Brak	-	Wszystkie grupy	święto	wolne
883900f7-2ddb-400a-abf2-cee8bcc8fd62	AwP4.0s1	2026-04-03	07:00:00	900	Przerwa świąteczna	Brak	-	Wszystkie grupy	święto	wolne
7e90dabb-53c0-44c1-82ab-a03f320dfa9c	AwP4.0s1	2026-04-04	07:00:00	900	Przerwa świąteczna	Brak	-	Wszystkie grupy	święto	wolne
3ac84fd4-382e-4e72-a5b9-eced06113113	AwP4.0s1	2026-04-05	07:00:00	900	Przerwa świąteczna	Brak	-	Wszystkie grupy	święto	wolne
27828129-b604-4d66-b434-88bd7c05603b	AwP4.0s1	2026-04-06	07:00:00	900	Przerwa świąteczna	Brak	-	Wszystkie grupy	święto	wolne
4f731f95-e2af-41f3-9ac1-1704fd1650bb	AwP4.0s1	2026-04-07	07:00:00	900	Przerwa świąteczna	Brak	-	Wszystkie grupy	święto	wolne
8656fec1-44ca-43c1-bad6-22992b026d26	AwP4.0s1	2026-04-08	16:15:00	90	HMI i SCADA w Przemyśle 4.0	mgr inż. M. Worwa	WA2	L1	laboratoria	aktywne
89ca4059-00fc-4f3f-b939-a6028c5180fc	AwP4.0s1	2026-04-08	18:00:00	90	Programowanie obiektowe	dr inż. R. Rucki	A1	W	wykład	aktywne
6eb1a703-04c7-46b9-afd7-84a5e0723583	AwP4.0s1	2026-04-09	09:15:00	90	Zaawansowane metody identyfikacji układów automatyki	dr inż. M. Orkisz	201	Lk1 / P1	laboratoria	aktywne
e68edcc5-1b74-4514-a606-2c7ee2290854	AwP4.0s1	2026-04-09	11:00:00	90	Zaawansowane metody identyfikacji układów automatyki	dr inż. M. Orkisz	A4	W	wykład	aktywne
64893e8c-ce46-4a79-accd-6092ce3a211b	AwP4.0s1	2026-04-09	12:45:00	90	Język angielski	mgr J. Firganek	139SJO	Lek1	laboratoria	aktywne
e6064bcb-01a4-4b96-9854-77a51f8de0ef	AwP4.0s1	2026-04-09	16:15:00	90	HMI i SCADA w Przemyśle 4.0	prof. R. Sałat	WA2	W	wykład	aktywne
131f054f-195b-42b0-997a-02361baa7b8b	AwP4.0s1	2026-04-09	18:00:00	90	Programowanie obiektowe	dr inż. R. Rucki	201	Lk1	laboratoria	aktywne
cd2240fc-a90b-4260-b3b8-82ad0330f0e4	AwP4.0s1	2026-04-10	11:00:00	90	Systemy operacyjne czasu rzeczywistego	dr inż. K. Suchenia	101B	L1	laboratoria	aktywne
bb10058e-be68-4123-b7ee-19e27b41a825	AwP4.0s1	2026-04-10	12:45:00	90	Systemy operacyjne czasu rzeczywistego	dr inż. K. Suchenia	101B	L2	laboratoria	aktywne
82e917df-44ba-4b04-9082-e07f0c326876	AwP4.0s1	2026-04-14	14:30:00	90	Komputerowe wspomaganie projektowania	prof. Ł. Ścisło	A4	W	wykład	aktywne
a29af574-8104-451b-a85a-dc897ef468db	AwP4.0s1	2026-04-14	18:00:00	90	Komputerowe wspomaganie projektowania	prof. Ł. Ścisło	11	Lk1	laboratoria	aktywne
3ce4f7b3-611c-41ea-9f7d-41414a1481b7	AwP4.0s1	2026-04-15	16:15:00	90	HMI i SCADA w Przemyśle 4.0	mgr inż. M. Worwa	WA2	L2	laboratoria	aktywne
933e9222-aa3c-442e-af5c-565dcc7f2922	AwP4.0s1	2026-04-15	18:00:00	90	Programowanie obiektowe	dr inż. R. Rucki	A1	W	wykład	aktywne
437e1c34-3092-4db2-9c1d-fbce89672319	AwP4.0s1	2026-04-16	09:15:00	90	Zaawansowane metody identyfikacji układów automatyki	dr inż. M. Orkisz	201	Lk1 / P1	laboratoria	aktywne
8e1d53d5-320d-453b-8223-3951802cdd30	AwP4.0s1	2026-04-16	11:00:00	90	Zaawansowane metody identyfikacji układów automatyki	dr inż. M. Orkisz	A4	W	wykład	aktywne
8bd2d01c-2e57-43ee-b8d1-e30b2d3f56cb	AwP4.0s1	2026-04-16	12:45:00	90	Język angielski	mgr J. Firganek	139SJO	Lek1	laboratoria	aktywne
70715f65-8d22-4343-a4c7-534d72a9eb28	AwP4.0s1	2026-04-16	18:00:00	90	Programowanie obiektowe	dr inż. R. Rucki	201	Lk1	laboratoria	aktywne
5d796b78-519c-4b83-8064-d76e38dda5f9	AwP4.0s1	2026-04-17	09:15:00	90	Systemy operacyjne czasu rzeczywistego	dr inż. K. Suchenia	A3	W	wykład	aktywne
e3244cb2-a274-4a02-9d44-cb9a76a345d0	AwP4.0s1	2026-04-17	11:00:00	90	Systemy operacyjne czasu rzeczywistego	dr inż. K. Suchenia	101B	L1	laboratoria	aktywne
d934387b-a14d-47e4-b513-5b00bd27d4ea	AwP4.0s1	2026-04-17	12:45:00	90	Systemy operacyjne czasu rzeczywistego	dr inż. K. Suchenia	101B	L2	laboratoria	aktywne
534602cb-592c-4d48-9c24-8bbcfd7dfa18	AwP4.0s1	2026-04-21	18:00:00	90	Komputerowe wspomaganie projektowania	prof. Ł. Ścisło	11	Lk1	laboratoria	aktywne
9573497c-d393-4fea-9f99-be57f21c3dc5	AwP4.0s1	2026-04-22	16:15:00	90	HMI i SCADA w Przemyśle 4.0	mgr inż. M. Worwa	WA2	L1	laboratoria	aktywne
fcd143a1-689a-463c-aa2f-7b24a94dff38	AwP4.0s1	2026-04-22	18:00:00	90	Programowanie obiektowe	dr inż. R. Rucki	A1	W	wykład	aktywne
c0d9f962-4819-4f20-96fe-d910b003866b	AwP4.0s1	2026-04-23	09:15:00	90	Zaawansowane metody identyfikacji układów automatyki	dr inż. M. Orkisz	201	Lk1 / P1	laboratoria	aktywne
a2f8fcd6-c3bc-4255-9cba-eb03606395dd	AwP4.0s1	2026-04-23	11:00:00	90	Zaawansowane metody identyfikacji układów automatyki	dr inż. M. Orkisz	A4	W	wykład	aktywne
7f0f2d51-f8a4-47ee-99bc-954f3a0d2c31	AwP4.0s1	2026-04-23	12:45:00	135	Język angielski	mgr J. Firganek	139SJO	Lek1	laboratoria	aktywne
0acd8f03-4ac0-4e4e-ba5e-91a5e13e765b	AwP4.0s1	2026-04-23	15:30:00	135	HMI i SCADA w Przemyśle 4.0	prof. R. Sałat	WA2	W	wykład	aktywne
8b3c375c-49dc-4b58-a0f3-c82d1b510818	AwP4.0s1	2026-04-23	18:00:00	90	Programowanie obiektowe	dr inż. R. Rucki	201	Lk1	laboratoria	aktywne
39c7eeaa-532e-4596-9cb5-8dedac8a6c8e	AwP4.0s1	2026-04-24	11:00:00	90	Systemy operacyjne czasu rzeczywistego	dr inż. K. Suchenia	101B	P1	laboratoria	aktywne
647d7a27-3131-44ed-8bb2-5c7fc29e4e73	AwP4.0s1	2026-04-28	14:30:00	90	Komputerowe wspomaganie projektowania	prof. Ł. Ścisło	A4	W	wykład	aktywne
e2b2e34f-2a0e-449f-9e32-a7e6a8d13a45	AwP4.0s1	2026-04-28	18:00:00	90	Komputerowe wspomaganie projektowania	prof. Ł. Ścisło	11	Lk1	laboratoria	aktywne
cdbc70f1-3710-4abc-b4f8-082cbae1f7a8	AwP4.0s1	2026-04-29	16:15:00	90	HMI i SCADA w Przemyśle 4.0	mgr inż. M. Worwa	WA2	L2	laboratoria	aktywne
4307307b-6d29-467b-8e1d-7948628e3104	AwP4.0s1	2026-04-29	18:00:00	90	Programowanie obiektowe	dr inż. R. Rucki	A1	W	wykład	aktywne
02e7d998-d90f-473c-89df-cdc732698746	AwP4.0s1	2026-04-30	09:15:00	90	Zaawansowane metody identyfikacji układów automatyki	dr inż. M. Orkisz	201	Lk1 / P1	laboratoria	aktywne
3ea15ca3-cd79-448c-a76e-9c28d8221442	AwP4.0s1	2026-04-30	11:00:00	90	Zaawansowane metody identyfikacji układów automatyki	dr inż. M. Orkisz	A4	W	wykład	aktywne
c044ea27-0b6f-4c8b-b4a0-4adf80c4a0dd	AwP4.0s1	2026-04-30	12:45:00	90	Język angielski	mgr J. Firganek	139SJO	Lek1	laboratoria	aktywne
888abebe-267c-4b8e-844e-6b4a96a287be	AwP4.0s1	2026-04-30	18:00:00	90	Programowanie obiektowe	dr inż. R. Rucki	201	Lk1	laboratoria	aktywne
4fb45222-9efd-433c-904d-91f647d06b1b	AwP4.0s1	2026-05-01	07:00:00	900	Majówka	Brak	-	Wszystkie grupy	święto	wolne
428abece-3c73-4614-8dbb-7fa9e676b9ed	AwP4.0s1	2026-05-02	07:00:00	900	Majówka	Brak	-	Wszystkie grupy	święto	wolne
675bdb8f-810f-4568-a171-d3e578443e9d	AwP4.0s1	2026-05-03	07:00:00	900	Majówka	Brak	-	Wszystkie grupy	święto	wolne
65a8ef53-efc2-4598-94e5-553846639307	AwP4.0s1	2026-05-04	07:00:00	900	Majówka	Brak	-	Wszystkie grupy	święto	wolne
28a8829e-9ac5-47ba-b072-e51f22aab7e5	AwP4.0s1	2026-05-05	18:00:00	90	Komputerowe wspomaganie projektowania	prof. Ł. Ścisło	11	Lk1	laboratoria	aktywne
e937d639-b243-4004-b4b2-3479f32fdb6c	AwP4.0s1	2026-05-06	16:15:00	90	HMI i SCADA w Przemyśle 4.0	mgr inż. M. Worwa	WA2	L1	laboratoria	aktywne
d01dae35-f82c-4ff2-91b5-6c4d9cd483e2	AwP4.0s1	2026-05-06	18:00:00	90	Programowanie obiektowe	dr inż. R. Rucki	A1	W	wykład	aktywne
6e118e8d-baba-43fc-b8d4-d1ce829a1c00	AwP4.0s1	2026-05-07	09:15:00	90	Zaawansowane metody identyfikacji układów automatyki	dr inż. M. Orkisz	201	Lk1 / P1	laboratoria	aktywne
c307e8ee-201a-4952-b682-32f6906583f8	AwP4.0s1	2026-05-07	11:00:00	90	Zaawansowane metody identyfikacji układów automatyki	dr inż. M. Orkisz	A4	W	wykład	aktywne
96a67fb8-6fe2-4a1f-8882-8f9f33e2d41c	AwP4.0s1	2026-05-07	12:45:00	135	Język angielski	mgr J. Firganek	139SJO	Lek1	laboratoria	aktywne
bddc8e8a-ed66-4c19-aa1c-bfb1c6a61c99	AwP4.0s1	2026-05-07	16:15:00	90	HMI i SCADA w Przemyśle 4.0	prof. R. Sałat	WA2	W	wykład	aktywne
59074741-abd1-4dd5-923b-3fde73b95948	AwP4.0s1	2026-05-07	18:00:00	90	Programowanie obiektowe	dr inż. R. Rucki	201	Lk1	laboratoria	aktywne
ed7f6f12-51f0-44a1-b7f5-635c665a88a8	AwP4.0s1	2026-05-08	11:00:00	90	Systemy operacyjne czasu rzeczywistego	dr inż. K. Suchenia	101B	P1	laboratoria	aktywne
750e5b78-c932-4eef-acf5-dff95280c42e	AwP4.0s1	2026-05-12	07:00:00	900	Święto Szkoły	Brak	-	Wszystkie grupy	święto	wolne
24e1cd06-32da-42d5-b14c-85c4ce108226	AwP4.0s1	2026-05-13	16:15:00	90	HMI i SCADA w Przemyśle 4.0	mgr inż. M. Worwa	WA2	L2	laboratoria	aktywne
549a3748-30eb-4d42-8808-62584992e3e8	AwP4.0s1	2026-05-13	18:00:00	90	Programowanie obiektowe	dr inż. R. Rucki	A1	W	wykład	aktywne
6ac2b714-8c67-4e56-a9a7-1f652f5b13f5	AwP4.0s1	2026-05-14	09:15:00	90	Zaawansowane metody identyfikacji układów automatyki	dr inż. M. Orkisz	201	Lk1 / P1	laboratoria	aktywne
bab06dd4-fce6-419e-a747-ba5a21b9c59a	AwP4.0s1	2026-05-14	12:45:00	90	Język angielski	mgr J. Firganek	139SJO	Lek1	laboratoria	aktywne
896925fa-e11a-4994-8bfb-c575dceccbd5	AwP4.0s1	2026-05-14	18:00:00	90	Programowanie obiektowe	dr inż. R. Rucki	201	Lk1	laboratoria	aktywne
68ac1b13-f4d1-441b-81c2-63ca781ad573	AwP4.0s1	2026-05-15	09:15:00	90	Systemy operacyjne czasu rzeczywistego	dr inż. K. Suchenia	A3	W	wykład	aktywne
d07ecacb-c8d1-4611-902b-f91c9131f676	AwP4.0s1	2026-05-15	11:00:00	90	Systemy operacyjne czasu rzeczywistego	dr inż. K. Suchenia	101B	P1	laboratoria	aktywne
f18975f1-efab-4bd1-994b-2f754e4a98bd	AwP4.0s1	2026-05-19	18:00:00	90	Komputerowe wspomaganie projektowania	prof. Ł. Ścisło	11	Lk1	laboratoria	aktywne
83ae9e09-8533-440f-a8c8-decda732738b	AwP4.0s1	2026-05-20	16:15:00	90	HMI i SCADA w Przemyśle 4.0	mgr inż. M. Worwa	WA2	L1	laboratoria	aktywne
fdeb2a20-9dc3-403e-bb5e-1e0055bc486e	AwP4.0s1	2026-05-20	18:00:00	90	Programowanie obiektowe	dr inż. R. Rucki	A1	W	wykład	aktywne
6b89ec13-c1ae-40be-b316-84a144c38e33	AwP4.0s1	2026-05-21	09:15:00	90	Zaawansowane metody identyfikacji układów automatyki	dr inż. M. Orkisz	201	Lk1 / P1	laboratoria	aktywne
e8a42448-a580-48c0-96c5-0f07a64dc6e6	AwP4.0s1	2026-05-21	12:45:00	90	Język angielski	mgr J. Firganek	139SJO	Lek1	laboratoria	aktywne
7f508ae6-a2da-4ee9-a9da-088ca34eb412	AwP4.0s1	2026-05-21	16:15:00	90	HMI i SCADA w Przemyśle 4.0	prof. R. Sałat	WA2	W	wykład	aktywne
5e22f049-3248-45aa-9e4d-aeae644005f2	AwP4.0s1	2026-05-21	18:00:00	90	Programowanie obiektowe	dr inż. R. Rucki	201	Lk1	laboratoria	aktywne
ffd7345d-54e2-461a-8e84-7037e3cbda8d	AwP4.0s1	2026-05-22	11:00:00	90	Systemy operacyjne czasu rzeczywistego	dr inż. K. Suchenia	101B	P1	laboratoria	aktywne
77822711-36b9-4dbd-b0f1-4ce3b2b3d01c	AwP4.0s1	2026-05-24	07:00:00	900	Zielone Świątki	Brak	-	Wszystkie grupy	święto	wolne
991cc5b7-5446-40ad-a4b1-a573c843eb85	AwP4.0s1	2026-05-26	14:30:00	90	Komputerowe wspomaganie projektowania	prof. Ł. Ścisło	A4	W	wykład	aktywne
08830ac0-69cb-40da-af77-e7214a650402	AwP4.0s1	2026-05-26	18:00:00	90	Komputerowe wspomaganie projektowania	prof. Ł. Ścisło	11	Lk1	laboratoria	aktywne
4ef2bb72-06e2-4513-a05c-ad6321f10d01	AwP4.0s1	2026-05-27	16:15:00	90	HMI i SCADA w Przemyśle 4.0	mgr inż. M. Worwa	WA2	L2	laboratoria	aktywne
07338046-9191-43cf-9855-8171f060fadf	AwP4.0s1	2026-05-27	18:00:00	45	Programowanie obiektowe	dr inż. R. Rucki	A1	W	wykład	aktywne
a6d85434-1476-405b-bd3f-453174077931	AwP4.0s1	2026-05-28	09:15:00	90	Zaawansowane metody identyfikacji układów automatyki	dr inż. M. Orkisz	201	Lk1 / P1	laboratoria	aktywne
11da8d27-6e4e-4e32-b658-77c77acb314b	AwP4.0s1	2026-05-28	12:45:00	90	Język angielski	mgr J. Firganek	139SJO	Lek1	laboratoria	aktywne
533a45f9-1791-41ed-8001-669926d20269	AwP4.0s1	2026-05-28	18:00:00	90	Programowanie obiektowe	dr inż. R. Rucki	201	Lk1	laboratoria	aktywne
c220df74-485f-433f-ae29-4b7b75f79c20	AwP4.0s1	2026-05-29	09:15:00	90	Systemy operacyjne czasu rzeczywistego	dr inż. K. Suchenia	A3	W	wykład	aktywne
b114ae8f-84a0-4d82-981d-915aac1a5970	AwP4.0s1	2026-05-29	11:00:00	90	Systemy operacyjne czasu rzeczywistego	dr inż. K. Suchenia	101B	P1	laboratoria	aktywne
6d7c763a-479c-4b4a-b79e-6df71c6c1f5e	AwP4.0s1	2026-06-02	18:00:00	90	Komputerowe wspomaganie projektowania	prof. Ł. Ścisło	11	Lk1	laboratoria	aktywne
9be1d9cd-6655-4d30-82fd-456a26944d93	AwP4.0s1	2026-06-03	16:15:00	45	HMI i SCADA w Przemyśle 4.0	mgr inż. M. Worwa	WA2	L1	laboratoria	aktywne
853d5d03-8a6a-4557-842e-4db6700b132c	AwP4.0s1	2026-06-04	07:00:00	900	Boże Ciało	Brak	-	Wszystkie grupy	święto	wolne
68fe3a57-c6a9-48fa-bb79-9400175ae24b	AwP4.0s1	2026-06-05	07:00:00	900	Boże Ciało	Brak	-	Wszystkie grupy	święto	wolne
e1716c8f-ab2e-4518-8e1d-d05f0d7ea065	AwP4.0s1	2026-06-09	14:30:00	90	Komputerowe wspomaganie projektowania	prof. Ł. Ścisło	A4	W	wykład	aktywne
de9f3e40-2768-4062-8739-0539f52026a5	AwP4.0s1	2026-06-09	18:00:00	45	Komputerowe wspomaganie projektowania	prof. Ł. Ścisło	11	Lk1	laboratoria	aktywne
eeb2ff08-00c6-4c4c-8f12-160bfb4f6985	AwP4.0s1	2026-06-10	16:15:00	90	HMI i SCADA w Przemyśle 4.0	mgr inż. M. Worwa	WA2	L2	laboratoria	aktywne
633e3198-00e5-4e66-97b1-8274fb700280	AwP4.0s1	2026-06-11	09:15:00	90	Zaawansowane metody identyfikacji układów automatyki	dr inż. M. Orkisz	201	Lk1 / P1	laboratoria	aktywne
c85d3962-32c6-484e-9b1e-c7d643b2bafe	AwP4.0s1	2026-06-11	12:45:00	90	Język angielski	mgr J. Firganek	139SJO	Lek1	laboratoria	aktywne
562630ad-41d2-4e5c-bdfe-8f9b9de45b7f	AwP4.0s1	2026-06-12	09:15:00	90	Systemy operacyjne czasu rzeczywistego	dr inż. K. Suchenia	A3	W	wykład	aktywne
5e543824-3e66-4d1f-a89f-bc1c961adb12	AwP4.0s1_EEs1	2026-02-23	09:15:00	90	Mikrokontrolery i sterowniki programowalne	dr inż. S. Żaba	A1	W	wykład	aktywne
c7439410-3132-4159-add3-11a2cd223796	AwP4.0s1_EEs1	2026-02-23	11:00:00	90	Mikrokontrolery i sterowniki programowalne	dr inż. S. Żaba	06	L1	laboratoria	aktywne
e2bf8544-df4b-4ca8-bcf1-e4ccd13cb402	AwP4.0s1_EEs1	2026-02-23	12:45:00	135	Energoelektronika przemysłowa	dr inż. Z. Szular	109B	Lk1	laboratoria	aktywne
636f290c-52c1-4df2-98b9-e77037d60c7b	AwP4.0s1_EEs1	2026-02-23	16:15:00	90	Pomiary elektryczne wielkości nieelektrycznych	prof. K. Tomczyk	A1	W	wykład	aktywne
041f1c3f-58f3-43c4-88ba-4c05849bc76e	AwP4.0s1_EEs1	2026-02-24	09:30:00	135	Energoelektronika przemysłowa	dr inż. Z. Szular / mgr inż. M. Wawro	013B	L1	laboratoria	aktywne
ffc791e0-e38b-4977-b9df-7a8a064cd0a7	AwP4.0s1_EEs1	2026-02-24	10:15:00	90	Pomiary elektryczne wielkości nieelektrycznych	prof. K. Tomczyk	208B	L3	laboratoria	aktywne
f3c82941-7365-496c-936b-ce1b2fd60904	AwP4.0s1_EEs1	2026-02-24	12:00:00	90	Pomiary elektryczne wielkości nieelektrycznych	prof. K. Tomczyk / dr inż. M. Sieja	208B	L1	laboratoria	aktywne
800fa053-cc37-4363-9575-27a8cb349773	AwP4.0s1_EEs1	2026-02-24	12:00:00	135	Energoelektronika przemysłowa	dr inż. Z. Szular / mgr inż. M. Wawro	013B	L3	laboratoria	aktywne
362e7fa5-7dc0-4ccb-973d-7fa33ab8f9e1	AwP4.0s1_EEs1	2026-02-24	14:30:00	90	Inżynieria sterowania	dr inż. M. Pawlik	9	W	wykład	aktywne
1c689526-5b29-4cc8-8c64-4d567cd193f6	AwP4.0s1_EEs1	2026-02-24	16:15:00	90	Inżynieria sterowania	dr inż. M. Pawlik	18	Lk1	laboratoria	aktywne
18edf1ed-7dc8-498a-8509-98b6454da708	AwP4.0s1_EEs1	2026-02-24	18:00:00	90	Inżynieria sterowania	dr inż. M. Pawlik	18	Lk2	laboratoria	aktywne
248b0f21-a93f-4f44-88b9-9c226a0ecd37	AwP4.0s1_EEs1	2026-02-24	19:45:00	90	Mikrokontrolery i sterowniki programowalne	dr inż. S. Żaba	06	P2	laboratoria	aktywne
36c375d0-a4b4-4aed-a123-ee6d4ec0df79	AwP4.0s1_EEs1	2026-02-26	14:30:00	90	Energoelektronika przemysłowa	prof. W. Mazgaj / dr inż. Z. Szular	A4	W	wykład	aktywne
3143de9c-a8fb-42ac-a151-b45c61f9d499	AwP4.0s1_EEs1	2026-03-02	09:15:00	90	Mikrokontrolery i sterowniki programowalne	dr inż. S. Żaba	A1	W	wykład	aktywne
f16a9376-f436-4a62-b12a-818362cb22f1	AwP4.0s1_EEs1	2026-03-02	11:00:00	90	Mikrokontrolery i sterowniki programowalne	dr inż. S. Żaba	06	L2	laboratoria	aktywne
f6c28e96-15bc-44c0-8de9-d787a1dbd0ec	AwP4.0s1_EEs1	2026-03-02	12:45:00	135	Energoelektronika przemysłowa	dr inż. Z. Szular	109B	Lk2	laboratoria	aktywne
0c752d07-4a75-4f6f-acfb-ab7c93f1fcbe	AwP4.0s1_EEs1	2026-03-02	16:15:00	90	Mikrokontrolery i sterowniki programowalne	dr inż. A. Drwal	A1	W	wykład	aktywne
84594a92-96b5-403e-b6da-f03225d2c69b	AwP4.0s1_EEs1	2026-03-02	18:00:00	90	Mikrokontrolery i sterowniki programowalne	dr inż. A. Drwal	06	L3	laboratoria	aktywne
321a54cb-cb8c-43c2-9278-dc045a35da20	AwP4.0s1_EEs1	2026-03-03	09:30:00	135	Energoelektronika przemysłowa	dr inż. Z. Szular / mgr inż. M. Wawro	013B	L2	laboratoria	aktywne
0362d093-ed7f-47e5-b892-4641e42bc111	AwP4.0s1_EEs1	2026-03-03	12:00:00	90	Pomiary elektryczne wielkości nieelektrycznych	dr inż. M. Sieja	208C	L2	laboratoria	aktywne
b371dc0d-c642-420c-9925-fa36227877bd	AwP4.0s1_EEs1	2026-03-03	16:15:00	90	Inżynieria sterowania	dr inż. M. Pawlik	18	P1	laboratoria	aktywne
3972a670-2589-4a6f-9ea1-250ed4652b5c	AwP4.0s1_EEs1	2026-03-03	18:00:00	90	Inżynieria sterowania	dr inż. M. Pawlik	18	P2	laboratoria	aktywne
6f5ce4b4-6c01-4f88-bfd4-b44abecf9e90	AwP4.0s1_EEs1	2026-03-04	10:00:00	90	Techniki negocjacyjne	mgr T. Kuta	9	W / C / S	wykład	aktywne
3a797620-f758-42d8-8b0f-fc22ec562743	AwP4.0s1_EEs1	2026-03-05	14:30:00	90	Energoelektronika przemysłowa	prof. W. Mazgaj / dr inż. Z. Szular	A4	W	wykład	aktywne
4201f725-f1d0-40fd-bafb-9661126a91f4	AwP4.0s1_EEs1	2026-03-09	09:15:00	90	Mikrokontrolery i sterowniki programowalne	dr inż. S. Żaba	A1	W	wykład	aktywne
4ddf299a-1cc3-4a29-a3e7-8b802eb3c7f8	AwP4.0s1_EEs1	2026-03-09	11:00:00	90	Mikrokontrolery i sterowniki programowalne	dr inż. S. Żaba	06	L1	laboratoria	aktywne
29a90d29-1b0a-4960-91aa-cb820ac75e06	AwP4.0s1_EEs1	2026-03-09	12:45:00	135	Energoelektronika przemysłowa	dr inż. Z. Szular	109B	Lk1	laboratoria	aktywne
974a8713-4bd2-457c-97f5-1a21387bed29	AwP4.0s1_EEs1	2026-03-09	16:15:00	90	Pomiary elektryczne wielkości nieelektrycznych	prof. K. Tomczyk	A1	W	wykład	aktywne
c71aa27e-5120-486f-b199-c4902a398128	AwP4.0s1_EEs1	2026-03-10	09:30:00	135	Energoelektronika przemysłowa	dr inż. Z. Szular / mgr inż. M. Wawro	013B	L1	laboratoria	aktywne
2bb726ae-31d7-4c8d-b53f-e3355b86709a	AwP4.0s1_EEs1	2026-03-10	10:15:00	90	Pomiary elektryczne wielkości nieelektrycznych	prof. K. Tomczyk	208B	L3	laboratoria	aktywne
4f84089f-dd89-4e7d-a25d-b3fb78b38808	AwP4.0s1_EEs1	2026-03-10	12:00:00	90	Pomiary elektryczne wielkości nieelektrycznych	prof. K. Tomczyk / dr inż. M. Sieja	208B	L1	laboratoria	aktywne
3aa5de7f-12e3-4138-bf49-c0e44740e66c	AwP4.0s1_EEs1	2026-03-10	12:00:00	135	Energoelektronika przemysłowa	dr inż. Z. Szular / mgr inż. M. Wawro	013B	L3	laboratoria	aktywne
4d94e394-5193-49df-8f87-db8d81369f67	AwP4.0s1_EEs1	2026-03-10	14:30:00	90	Inżynieria sterowania	dr inż. M. Pawlik	9	W	wykład	aktywne
72fe8d09-8c35-4839-a506-49b8ec77a11a	AwP4.0s1_EEs1	2026-03-10	16:15:00	90	Inżynieria sterowania	dr inż. M. Pawlik	18	Lk1	laboratoria	aktywne
9bc2ec26-f3e6-4453-a9b7-906b4aee892c	AwP4.0s1_EEs1	2026-03-10	18:00:00	90	Inżynieria sterowania	dr inż. M. Pawlik	18	Lk2	laboratoria	aktywne
2562fe90-9084-401c-a095-02de75239c2c	AwP4.0s1_EEs1	2026-03-10	19:45:00	90	Mikrokontrolery i sterowniki programowalne	dr inż. S. Żaba	06	P2	laboratoria	aktywne
3c976764-039b-4c04-a241-c9168b36e34e	AwP4.0s1_EEs1	2026-03-11	10:00:00	90	Techniki negocjacyjne	mgr T. Kuta	9	W / C / S	wykład	aktywne
677c26fe-7eca-4e0e-bfaa-24da23dfd00f	AwP4.0s1_EEs1	2026-03-12	14:30:00	90	Energoelektronika przemysłowa	prof. W. Mazgaj / dr inż. Z. Szular	A4	W	wykład	aktywne
9ae7ac23-0389-411e-b19b-eacf65682403	AwP4.0s1_EEs1	2026-03-16	09:15:00	90	Mikrokontrolery i sterowniki programowalne	dr inż. S. Żaba	A1	W	wykład	aktywne
5212d9db-a8d9-4680-80d3-39debc552108	AwP4.0s1_EEs1	2026-03-16	11:00:00	90	Mikrokontrolery i sterowniki programowalne	dr inż. S. Żaba	06	L2	laboratoria	aktywne
feec88f6-724d-4114-8e68-873fda137720	AwP4.0s1_EEs1	2026-03-16	12:45:00	135	Energoelektronika przemysłowa	dr inż. Z. Szular	109B	Lk2	laboratoria	aktywne
792f0637-6580-41bc-a149-5b10ccf6b55d	AwP4.0s1_EEs1	2026-03-16	16:15:00	90	Mikrokontrolery i sterowniki programowalne	dr inż. A. Drwal	A1	W	wykład	aktywne
a50c2bb9-5531-47f7-9e31-5eb4c0d85fbd	AwP4.0s1_EEs1	2026-03-16	18:00:00	90	Mikrokontrolery i sterowniki programowalne	dr inż. A. Drwal	06	L3	laboratoria	aktywne
2f8a1a5d-7f5d-4c79-90bd-117d9fe7abcf	AwP4.0s1_EEs1	2026-03-17	09:30:00	135	Energoelektronika przemysłowa	dr inż. Z. Szular / mgr inż. M. Wawro	013B	L2	laboratoria	aktywne
7aa82a7e-0a3f-4377-a206-dd03c6ebac18	AwP4.0s1_EEs1	2026-03-17	12:00:00	90	Pomiary elektryczne wielkości nieelektrycznych	dr inż. M. Sieja	208C	L2	laboratoria	aktywne
ecacf60a-9f62-42a3-9aed-d198a90c50f5	AwP4.0s1_EEs1	2026-03-17	16:15:00	90	Inżynieria sterowania	dr inż. M. Pawlik	18	P1	laboratoria	aktywne
4ab44383-0e46-451d-8bef-70ca67ea72f0	AwP4.0s1_EEs1	2026-03-17	18:00:00	90	Inżynieria sterowania	dr inż. M. Pawlik	18	P2	laboratoria	aktywne
30e5bb1f-63a3-47db-9759-f73fafad2400	AwP4.0s1_EEs1	2026-03-18	10:00:00	90	Techniki negocjacyjne	mgr T. Kuta	9	W / C / S	wykład	aktywne
c5b85d74-4962-48c0-bfb4-cd26624cd496	AwP4.0s1_EEs1	2026-03-19	14:30:00	90	Energoelektronika przemysłowa	prof. W. Mazgaj / dr inż. Z. Szular	A4	W	wykład	aktywne
2e70b8de-ff63-4a7e-9374-9001867c734e	AwP4.0s1_EEs1	2026-03-23	09:15:00	90	Mikrokontrolery i sterowniki programowalne	dr inż. S. Żaba	06	P1	laboratoria	aktywne
0370e6b9-eb36-4acd-b299-d41ba6f212d3	AwP4.0s1_EEs1	2026-03-23	11:00:00	90	Mikrokontrolery i sterowniki programowalne	dr inż. S. Żaba	06	L1	laboratoria	aktywne
5dc05eb4-2efc-4a9b-a206-e397e74a76f7	AwP4.0s1_EEs1	2026-03-23	12:45:00	135	Energoelektronika przemysłowa	dr inż. Z. Szular	109B	Lk1	laboratoria	aktywne
552864aa-ac1e-499f-af5d-e276fcef7507	AwP4.0s1_EEs1	2026-03-23	16:15:00	90	Pomiary elektryczne wielkości nieelektrycznych	prof. K. Tomczyk	A1	W	wykład	aktywne
c7ffa0b0-8210-470d-af42-2876f7a6956d	AwP4.0s1_EEs1	2026-03-24	09:30:00	135	Energoelektronika przemysłowa	dr inż. Z. Szular / mgr inż. M. Wawro	013B	L1	laboratoria	aktywne
8f343980-e213-4ad3-86ec-3f4af333d138	AwP4.0s1_EEs1	2026-03-24	10:15:00	90	Pomiary elektryczne wielkości nieelektrycznych	prof. K. Tomczyk	208B	L3	laboratoria	aktywne
573ea13c-4bf9-4271-bc0d-afb94de3f117	AwP4.0s1_EEs1	2026-03-24	12:00:00	90	Pomiary elektryczne wielkości nieelektrycznych	prof. K. Tomczyk / dr inż. M. Sieja	208B	L1	laboratoria	aktywne
b36aa823-4d05-4105-9d34-6d903625e2b7	AwP4.0s1_EEs1	2026-03-24	12:00:00	135	Energoelektronika przemysłowa	dr inż. Z. Szular / mgr inż. M. Wawro	013B	L3	laboratoria	aktywne
ce9c21e4-0291-47b1-92e3-557ca2940445	AwP4.0s1_EEs1	2026-03-24	14:30:00	90	Inżynieria sterowania	dr inż. M. Pawlik	9	W	wykład	aktywne
aa13757a-226c-49cb-aae0-c627fd826ca7	AwP4.0s1_EEs1	2026-03-24	16:15:00	90	Inżynieria sterowania	dr inż. M. Pawlik	18	Lk1	laboratoria	aktywne
f84dbf86-46b5-4e82-90c9-39c742352c3d	AwP4.0s1_EEs1	2026-03-24	18:00:00	90	Inżynieria sterowania	dr inż. M. Pawlik	18	Lk2	laboratoria	aktywne
57e914c2-68cf-44d1-a185-13c910b3d90b	AwP4.0s1_EEs1	2026-06-05	07:00:00	900	Boże Ciało	Brak	-	Wszystkie grupy	święto	wolne
b072a793-fcaa-40af-9829-9573a5741c52	AwP4.0s1_EEs1	2026-03-24	19:45:00	90	Mikrokontrolery i sterowniki programowalne	dr inż. S. Żaba	06	P2	laboratoria	aktywne
f9acdb48-a508-4265-b3e4-0efac567bfb3	AwP4.0s1_EEs1	2026-03-25	10:00:00	90	Techniki negocjacyjne	mgr T. Kuta	9	W / C / S	wykład	aktywne
28fa1b93-7cd0-461e-b7da-0540fa8f2df4	AwP4.0s1_EEs1	2026-03-26	14:30:00	90	Energoelektronika przemysłowa	prof. W. Mazgaj / dr inż. Z. Szular	A4	W	wykład	aktywne
dd4d7054-2d00-4931-9861-cf8ee25ed0d4	AwP4.0s1_EEs1	2026-03-30	09:15:00	90	Mikrokontrolery i sterowniki programowalne	dr inż. S. Żaba	06	P1	laboratoria	aktywne
dc65a966-ac4f-4dc1-937e-f03d2af73b5d	AwP4.0s1_EEs1	2026-03-30	11:00:00	90	Mikrokontrolery i sterowniki programowalne	dr inż. S. Żaba	06	L2	laboratoria	aktywne
493b8f7e-7f7c-4c83-8e0e-cf6b10e68b88	AwP4.0s1_EEs1	2026-03-30	12:45:00	135	Energoelektronika przemysłowa	dr inż. Z. Szular	109B	Lk2	laboratoria	aktywne
90e19d70-d925-47ee-8b46-722a5d6814ef	AwP4.0s1_EEs1	2026-03-30	16:15:00	90	Mikrokontrolery i sterowniki programowalne	dr inż. A. Drwal	A1	W	wykład	aktywne
69e42df1-df88-4327-a5da-3a103ceaf9a0	AwP4.0s1_EEs1	2026-03-30	18:00:00	90	Mikrokontrolery i sterowniki programowalne	dr inż. A. Drwal	06	L3	laboratoria	aktywne
fe679e35-6a82-4ab7-a678-345b44c1eb6f	AwP4.0s1_EEs1	2026-03-31	09:30:00	135	Energoelektronika przemysłowa	dr inż. Z. Szular / mgr inż. M. Wawro	013B	L2	laboratoria	aktywne
3b7feb02-687b-4ba4-bb8e-40507c995749	AwP4.0s1_EEs1	2026-03-31	12:00:00	90	Pomiary elektryczne wielkości nieelektrycznych	dr inż. M. Sieja	208C	L2	laboratoria	aktywne
2ab2eae5-32ca-4508-a8e8-cc9fa79e8c42	AwP4.0s1_EEs1	2026-03-31	16:15:00	90	Inżynieria sterowania	dr inż. M. Pawlik	18	P1	laboratoria	aktywne
bf5248fd-3ce1-40ae-9ffc-7aeabc1ca057	AwP4.0s1_EEs1	2026-03-31	18:00:00	90	Inżynieria sterowania	dr inż. M. Pawlik	18	P2	laboratoria	aktywne
074720aa-8988-465e-b10f-d6783a637564	AwP4.0s1_EEs1	2026-04-01	07:00:00	900	Przerwa świąteczna	Brak	-	Wszystkie grupy	święto	wolne
c4fb8b3d-7f6f-4849-a31c-8e0379cb337b	AwP4.0s1_EEs1	2026-04-02	07:00:00	900	Przerwa świąteczna	Brak	-	Wszystkie grupy	święto	wolne
e25b6228-377a-4ccb-a10d-0318011d3662	AwP4.0s1_EEs1	2026-04-03	07:00:00	900	Przerwa świąteczna	Brak	-	Wszystkie grupy	święto	wolne
31a91767-357b-4cd4-8822-0fee00770ff7	AwP4.0s1_EEs1	2026-04-04	07:00:00	900	Przerwa świąteczna	Brak	-	Wszystkie grupy	święto	wolne
d28075f6-8e31-400a-a727-bbb80cd0a324	AwP4.0s1_EEs1	2026-04-05	07:00:00	900	Przerwa świąteczna	Brak	-	Wszystkie grupy	święto	wolne
214cbd39-b4d6-4bac-90b1-cf70c59c51c8	AwP4.0s1_EEs1	2026-04-06	07:00:00	900	Przerwa świąteczna	Brak	-	Wszystkie grupy	święto	wolne
fbe0cfd6-e81f-456e-aa23-00b860df12c9	AwP4.0s1_EEs1	2026-04-07	07:00:00	900	Przerwa świąteczna	Brak	-	Wszystkie grupy	święto	wolne
8966e5ef-fa1c-4d03-98c3-14e593a19b0f	AwP4.0s1_EEs1	2026-04-08	10:00:00	90	Techniki negocjacyjne	mgr T. Kuta	9	W / C / S	wykład	aktywne
4c7cbbe0-a6df-45db-ad00-fc800bc879f0	AwP4.0s1_EEs1	2026-04-09	14:30:00	90	Energoelektronika przemysłowa	prof. W. Mazgaj / dr inż. Z. Szular	A4	W	wykład	aktywne
34a8e4b4-d889-49cd-9778-f212cdb10c0e	AwP4.0s1_EEs1	2026-04-13	09:15:00	90	Mikrokontrolery i sterowniki programowalne	dr inż. S. Żaba	06	P1	laboratoria	aktywne
7f4db22f-7dad-4c44-900b-bb01a365a769	AwP4.0s1_EEs1	2026-04-13	11:00:00	90	Mikrokontrolery i sterowniki programowalne	dr inż. S. Żaba	06	L2	laboratoria	aktywne
bb9745a5-c596-4d2a-a62b-bbe91cfe622e	AwP4.0s1_EEs1	2026-04-13	12:45:00	135	Energoelektronika przemysłowa	dr inż. Z. Szular	109B	Lk2	laboratoria	aktywne
debba798-86a0-4d2b-91d5-c81179d76d55	AwP4.0s1_EEs1	2026-04-13	16:15:00	45	Mikrokontrolery i sterowniki programowalne	dr inż. A. Drwal	A1	W	wykład	aktywne
8080485a-dcc5-47c4-baa2-13401d87bce8	AwP4.0s1_EEs1	2026-04-13	18:00:00	90	Mikrokontrolery i sterowniki programowalne	dr inż. A. Drwal	06	L3	laboratoria	aktywne
61760521-5396-430e-b360-b732e6bc5d10	AwP4.0s1_EEs1	2026-04-14	09:30:00	135	Energoelektronika przemysłowa	dr inż. Z. Szular / mgr inż. M. Wawro	013B	L2	laboratoria	aktywne
8e171265-0e79-4cb3-a991-6e55fcb24bb1	AwP4.0s1_EEs1	2026-04-14	12:00:00	90	Pomiary elektryczne wielkości nieelektrycznych	dr inż. M. Sieja	208C	L2	laboratoria	aktywne
568bc785-9842-4467-adab-0e3beea24e15	AwP4.0s1_EEs1	2026-04-14	16:15:00	90	Inżynieria sterowania	dr inż. M. Pawlik	18	P1	laboratoria	aktywne
edb19ff3-3687-4042-9c9c-ef98950870b3	AwP4.0s1_EEs1	2026-04-14	18:00:00	90	Inżynieria sterowania	dr inż. M. Pawlik	18	P2	laboratoria	aktywne
a4860a00-6798-4bfa-aecc-8c15a7cae8b5	AwP4.0s1_EEs1	2026-04-15	10:00:00	90	Techniki negocjacyjne	mgr T. Kuta	9	W / C / S	wykład	aktywne
886b4f5f-fd6c-4dd7-9ee3-d00557d65e6b	AwP4.0s1_EEs1	2026-04-16	14:30:00	90	Energoelektronika przemysłowa	prof. W. Mazgaj / dr inż. Z. Szular	A4	W	wykład	aktywne
6cb7cbe8-51f3-41e4-8c0b-0a3faac24ab0	AwP4.0s1_EEs1	2026-04-20	09:15:00	90	Mikrokontrolery i sterowniki programowalne	dr inż. S. Żaba	06	P1	laboratoria	aktywne
67d3cba7-14c2-45a6-8ca4-ec235d5bc6b4	AwP4.0s1_EEs1	2026-04-20	11:00:00	90	Mikrokontrolery i sterowniki programowalne	dr inż. S. Żaba	06	L1	laboratoria	aktywne
464c478a-b5e3-443c-bc2e-4617268e382a	AwP4.0s1_EEs1	2026-04-20	12:45:00	135	Energoelektronika przemysłowa	dr inż. Z. Szular	109B	Lk1	laboratoria	aktywne
7e398faf-72bf-4522-a64e-0c9d5143c1ed	AwP4.0s1_EEs1	2026-04-20	16:15:00	90	Pomiary elektryczne wielkości nieelektrycznych	prof. K. Tomczyk	A1	W	wykład	aktywne
10818a93-01ae-4ad4-a589-96aa72b961bb	AwP4.0s1_EEs1	2026-04-21	09:30:00	135	Energoelektronika przemysłowa	dr inż. Z. Szular / mgr inż. M. Wawro	013B	L1	laboratoria	aktywne
4baf3914-7c62-40f7-bf91-5d816b559c76	AwP4.0s1_EEs1	2026-04-21	10:15:00	90	Pomiary elektryczne wielkości nieelektrycznych	prof. K. Tomczyk	208B	L3	laboratoria	aktywne
7da1c0fa-57d7-41b0-b979-c00db93e8956	AwP4.0s1_EEs1	2026-04-21	12:00:00	90	Pomiary elektryczne wielkości nieelektrycznych	prof. K. Tomczyk / dr inż. M. Sieja	208B	L1	laboratoria	aktywne
c5962933-0684-4335-adb9-fb10cdeb4b01	AwP4.0s1_EEs1	2026-04-21	12:00:00	135	Energoelektronika przemysłowa	dr inż. Z. Szular / mgr inż. M. Wawro	013B	L3	laboratoria	aktywne
4155bad8-3b29-41f2-9256-7a86b1def604	AwP4.0s1_EEs1	2026-04-21	14:30:00	90	Inżynieria sterowania	dr inż. M. Pawlik	9	W	wykład	aktywne
ce1b6aaa-cbb3-4e2e-bfa8-b8d38b16066b	AwP4.0s1_EEs1	2026-04-21	16:15:00	90	Inżynieria sterowania	dr inż. M. Pawlik	18	Lk1	laboratoria	aktywne
ac9544f0-25f6-4986-9629-927129c0f108	AwP4.0s1_EEs1	2026-04-21	18:00:00	90	Inżynieria sterowania	dr inż. M. Pawlik	18	Lk2	laboratoria	aktywne
bcbf8b7c-95d4-4909-9dae-b430c85e89ca	AwP4.0s1_EEs1	2026-04-21	19:45:00	90	Mikrokontrolery i sterowniki programowalne	dr inż. S. Żaba	06	P2	laboratoria	aktywne
c4fc5528-6d34-4f6c-ab68-ee0154b9c6c9	AwP4.0s1_EEs1	2026-04-22	10:00:00	90	Techniki negocjacyjne	mgr T. Kuta	9	W / C / S	wykład	aktywne
8faf8855-a078-4400-b9b1-ecfac9686388	AwP4.0s1_EEs1	2026-04-27	09:15:00	90	Mikrokontrolery i sterowniki programowalne	dr inż. S. Żaba	06	P1	laboratoria	aktywne
ab270e45-0b9f-459b-83c9-08d52de08309	AwP4.0s1_EEs1	2026-04-27	11:00:00	90	Mikrokontrolery i sterowniki programowalne	dr inż. S. Żaba	06	L2	laboratoria	aktywne
66f6afdf-d287-4332-a77f-509cf662c0f8	AwP4.0s1_EEs1	2026-04-27	12:45:00	135	Energoelektronika przemysłowa	dr inż. Z. Szular	109B	Lk2	laboratoria	aktywne
2a9d5b4a-539a-4c9d-9017-3fc2fe9cd75c	AwP4.0s1_EEs1	2026-04-27	18:00:00	90	Mikrokontrolery i sterowniki programowalne	dr inż. A. Drwal	06	L3	laboratoria	aktywne
993b5fa5-10ee-4cdf-94e4-38584b8629fd	AwP4.0s1_EEs1	2026-04-28	09:30:00	135	Energoelektronika przemysłowa	dr inż. Z. Szular / mgr inż. M. Wawro	013B	L2	laboratoria	aktywne
9f186527-10d0-490c-938b-f3157be01863	AwP4.0s1_EEs1	2026-04-28	12:00:00	90	Pomiary elektryczne wielkości nieelektrycznych	dr inż. M. Sieja	208C	L2	laboratoria	aktywne
bb839273-31ad-4550-8916-6bc0bafc3138	AwP4.0s1_EEs1	2026-04-28	16:15:00	90	Inżynieria sterowania	dr inż. M. Pawlik	18	P1	laboratoria	aktywne
eac8787a-1bac-45ce-9043-cc7a00a20d2c	AwP4.0s1_EEs1	2026-04-28	18:00:00	90	Inżynieria sterowania	dr inż. M. Pawlik	18	P2	laboratoria	aktywne
358a5eeb-a2d0-4371-bca3-1dae140eaee5	AwP4.0s1_EEs1	2026-04-29	10:00:00	90	Techniki negocjacyjne	mgr T. Kuta	9	W / C / S	wykład	aktywne
29f804e6-a632-4f3c-9e2f-04359270eb6b	AwP4.0s1_EEs1	2026-05-01	07:00:00	900	Majówka	Brak	-	Wszystkie grupy	święto	wolne
f487d034-0a69-4048-a422-be5d4d634cb7	AwP4.0s1_EEs1	2026-05-02	07:00:00	900	Majówka	Brak	-	Wszystkie grupy	święto	wolne
48ea89af-4009-461e-9284-2a0ae66378c6	AwP4.0s1_EEs1	2026-05-03	07:00:00	900	Majówka	Brak	-	Wszystkie grupy	święto	wolne
7121f751-6357-4a00-a8ac-3c11665eb55c	AwP4.0s1_EEs1	2026-05-04	07:00:00	900	Majówka	Brak	-	Wszystkie grupy	święto	wolne
525f0f63-ba70-4a07-a777-53fe47c0c101	AwP4.0s1_EEs1	2026-05-05	09:30:00	135	Energoelektronika przemysłowa	dr inż. Z. Szular / mgr inż. M. Wawro	013B	L1	laboratoria	aktywne
a4c4791f-a58a-43aa-abc7-c459556012af	AwP4.0s1_EEs1	2026-05-05	10:15:00	90	Pomiary elektryczne wielkości nieelektrycznych	prof. K. Tomczyk	208B	L3	laboratoria	aktywne
a0dc11c2-999a-4ae3-bfbe-19b1f153fbc8	AwP4.0s1_EEs1	2026-05-05	12:00:00	90	Pomiary elektryczne wielkości nieelektrycznych	prof. K. Tomczyk / dr inż. M. Sieja	208B	L1	laboratoria	aktywne
77deca06-c796-4135-90e9-4b1b3652fddc	AwP4.0s1_EEs1	2026-05-05	12:00:00	135	Energoelektronika przemysłowa	dr inż. Z. Szular / mgr inż. M. Wawro	013B	L3	laboratoria	aktywne
e2c60093-5dbf-429d-850a-e2253acced44	AwP4.0s1_EEs1	2026-05-05	14:30:00	90	Inżynieria sterowania	dr inż. M. Pawlik	9	W	wykład	aktywne
9a860b73-524b-40e7-ad9a-7ca8e1bfb355	AwP4.0s1_EEs1	2026-05-05	16:15:00	90	Inżynieria sterowania	dr inż. M. Pawlik	18	Lk1	laboratoria	aktywne
35aa0dad-9986-4981-b04e-b52636215537	AwP4.0s1_EEs1	2026-05-05	18:00:00	90	Inżynieria sterowania	dr inż. M. Pawlik	18	Lk2	laboratoria	aktywne
8b93e232-4d8f-496a-863c-831d0afaac15	AwP4.0s1_EEs1	2026-05-05	19:45:00	90	Mikrokontrolery i sterowniki programowalne	dr inż. S. Żaba	06	P2	laboratoria	aktywne
b029c14a-473a-42fd-bfe9-0874af509e47	AwP4.0s1_EEs1	2026-05-06	10:00:00	90	Techniki negocjacyjne	mgr T. Kuta	9	W / C / S	wykład	aktywne
a955ce9f-e904-4747-94a1-1005eb490641	AwP4.0s1_EEs1	2026-05-11	09:15:00	90	Mikrokontrolery i sterowniki programowalne	dr inż. S. Żaba	06	P1	laboratoria	aktywne
2969faa2-5eea-4518-a615-6d368bfa9fad	AwP4.0s1_EEs1	2026-05-11	11:00:00	90	Mikrokontrolery i sterowniki programowalne	dr inż. S. Żaba	06	L2	laboratoria	aktywne
3b4ceaed-0399-4dac-b007-0758acb5e2e3	AwP4.0s1_EEs1	2026-05-11	18:00:00	90	Mikrokontrolery i sterowniki programowalne	dr inż. A. Drwal	06	L3	laboratoria	aktywne
bb48d14b-63ec-4af1-acad-e799b2f4abbb	AwP4.0s1_EEs1	2026-05-12	07:00:00	900	Święto Szkoły	Brak	-	Wszystkie grupy	święto	wolne
086a82f2-3ddb-4ce6-a128-936b05c1cb6e	AwP4.0s1_EEs1	2026-05-13	10:00:00	90	Techniki negocjacyjne	mgr T. Kuta	9	W / C / S	wykład	aktywne
47020ada-5689-432f-99b9-9ea10ddf630d	AwP4.0s1_EEs1	2026-05-18	09:15:00	90	Mikrokontrolery i sterowniki programowalne	dr inż. S. Żaba	06	P1	laboratoria	aktywne
a0ada048-7a67-4ae5-a146-bd863302dbf1	AwP4.0s1_EEs1	2026-05-18	11:00:00	90	Mikrokontrolery i sterowniki programowalne	dr inż. S. Żaba	06	L1	laboratoria	aktywne
38d369aa-5044-4f31-b38d-56baee40739d	AwP4.0s1_EEs1	2026-05-18	12:45:00	135	Energoelektronika przemysłowa	dr inż. Z. Szular	109B	Lk1	laboratoria	aktywne
f6247c1e-6feb-41d3-a951-28e96081f3a6	AwP4.0s1_EEs1	2026-05-18	15:30:00	135	Pomiary elektryczne wielkości nieelektrycznych	prof. K. Tomczyk	A1	W	wykład	aktywne
5d2355d9-f261-442a-b36a-5c44c7b9a905	AwP4.0s1_EEs1	2026-05-19	10:15:00	90	Pomiary elektryczne wielkości nieelektrycznych	prof. K. Tomczyk	208B	L3	laboratoria	aktywne
529d2f34-eb03-48ad-9227-2cf1a1144bee	AwP4.0s1_EEs1	2026-05-19	12:00:00	90	Pomiary elektryczne wielkości nieelektrycznych	prof. K. Tomczyk / dr inż. M. Sieja	208B	L1	laboratoria	aktywne
58dfaf38-f4c0-46ac-be6a-0769cce9e50e	AwP4.0s1_EEs1	2026-05-19	14:30:00	90	Inżynieria sterowania	dr inż. M. Pawlik	9	W	wykład	aktywne
9d9ff198-7c7b-46ec-a100-b671d861f259	AwP4.0s1_EEs1	2026-05-19	16:15:00	90	Inżynieria sterowania	dr inż. M. Pawlik	18	Lk1	laboratoria	aktywne
81dd9768-c18b-4843-93ff-3ea98727245a	AwP4.0s1_EEs1	2026-05-19	18:00:00	90	Inżynieria sterowania	dr inż. M. Pawlik	18	Lk2	laboratoria	aktywne
fee68051-4ab9-4167-8f79-e592d6638e29	AwP4.0s1_EEs1	2026-05-19	19:45:00	90	Mikrokontrolery i sterowniki programowalne	dr inż. S. Żaba	06	P2	laboratoria	aktywne
46240b96-bee1-4f43-80bb-1085367e8711	AwP4.0s1_EEs1	2026-05-20	10:00:00	90	Techniki negocjacyjne	mgr T. Kuta	9	W / C / S	wykład	aktywne
64c49a1e-c553-4fbf-8c2c-06c8bb02800e	AwP4.0s1_EEs1	2026-05-24	07:00:00	900	Zielone Świątki	Brak	-	Wszystkie grupy	święto	wolne
87daf16a-f602-4ea6-977a-23cd3f5429c2	AwP4.0s1_EEs1	2026-05-25	11:00:00	90	Mikrokontrolery i sterowniki programowalne	dr inż. S. Żaba	06	L2	laboratoria	aktywne
e1b993b4-ae39-45e2-a517-7115d12236c2	AwP4.0s1_EEs1	2026-05-25	18:00:00	90	Mikrokontrolery i sterowniki programowalne	dr inż. A. Drwal	06	L3	laboratoria	aktywne
5ced9305-1ccf-4bb1-aba0-05dcf4da288c	AwP4.0s1_EEs1	2026-05-26	12:00:00	90	Pomiary elektryczne wielkości nieelektrycznych	dr inż. M. Sieja	208C	L2	laboratoria	aktywne
9736685c-66a9-46bd-b315-53efe6b86c01	AwP4.0s1_EEs1	2026-05-26	16:15:00	90	Inżynieria sterowania	dr inż. M. Pawlik	18	P1	laboratoria	aktywne
587c6706-3f4a-4aec-b75c-100604778c7a	AwP4.0s1_EEs1	2026-05-26	18:00:00	90	Inżynieria sterowania	dr inż. M. Pawlik	18	P2	laboratoria	aktywne
1f7256ce-8ea7-4d33-ac6e-d6f62899369f	AwP4.0s1_EEs1	2026-05-27	10:00:00	90	Techniki negocjacyjne	mgr T. Kuta	9	W / C / S	wykład	aktywne
b2278582-a26b-47ec-a188-daf7af08fcf2	AwP4.0s1_EEs1	2026-06-01	11:00:00	90	Mikrokontrolery i sterowniki programowalne	dr inż. S. Żaba	06	L1	laboratoria	aktywne
c2fe6bef-a1fe-43fd-b29c-0157291e6c15	AwP4.0s1_EEs1	2026-06-01	16:15:00	90	Pomiary elektryczne wielkości nieelektrycznych	prof. K. Tomczyk	A1	W	wykład	aktywne
94b29e0e-9719-4034-b7fa-81d1f30d13a0	AwP4.0s1_EEs1	2026-06-02	10:15:00	90	Pomiary elektryczne wielkości nieelektrycznych	prof. K. Tomczyk	208B	L3	laboratoria	aktywne
b99a7b1f-1daf-48e1-8d9d-5cc82a80beee	AwP4.0s1_EEs1	2026-06-02	12:00:00	90	Pomiary elektryczne wielkości nieelektrycznych	prof. K. Tomczyk / dr inż. M. Sieja	208B	L1	laboratoria	aktywne
1821edaa-54a6-49f4-9c1f-5e2df83f4311	AwP4.0s1_EEs1	2026-06-02	14:30:00	90	Inżynieria sterowania	dr inż. M. Pawlik	9	W	wykład	aktywne
6b19facb-f2ab-48cc-83ca-42d705cae123	AwP4.0s1_EEs1	2026-06-02	16:15:00	90	Inżynieria sterowania	dr inż. M. Pawlik	18	Lk1	laboratoria	aktywne
9a74b602-622e-4d50-90d1-b827b4ef38c4	AwP4.0s1_EEs1	2026-06-02	18:00:00	90	Inżynieria sterowania	dr inż. M. Pawlik	18	Lk2	laboratoria	aktywne
8ae2116b-11a7-41fb-82e4-1be6aac1531a	AwP4.0s1_EEs1	2026-06-02	19:45:00	90	Mikrokontrolery i sterowniki programowalne	dr inż. S. Żaba	06	P2	laboratoria	aktywne
0b12a9d5-caf6-4f25-961f-262d8c38088f	AwP4.0s1_EEs1	2026-06-03	10:00:00	90	Techniki negocjacyjne	mgr T. Kuta	9	W / C / S	wykład	aktywne
cf2ab2a5-75ee-4c7f-8705-d5759d275a70	AwP4.0s1_EEs1	2026-06-04	07:00:00	900	Boże Ciało	Brak	-	Wszystkie grupy	święto	wolne
a0ff6d1b-c0f3-4d6d-821e-a79149d821c3	AwP4.0s1_EEs1	2026-06-09	12:00:00	90	Pomiary elektryczne wielkości nieelektrycznych	dr inż. M. Sieja	208C	L2	laboratoria	aktywne
f11ab8f1-a54f-49df-be65-85b9c6868147	AwP4.0s1_EEs1	2026-06-09	16:15:00	90	Inżynieria sterowania	dr inż. M. Pawlik	18	P1	laboratoria	aktywne
24f9ee76-e881-46f2-8fb3-92304726f98a	AwP4.0s1_EEs1	2026-06-09	18:00:00	90	Inżynieria sterowania	dr inż. M. Pawlik	18	P2	laboratoria	aktywne
3e2bb3ab-1222-4df8-aa86-7a218a9afc1e	AwP4.0s1_EEs1	2026-06-15	16:15:00	90	Pomiary elektryczne wielkości nieelektrycznych	prof. K. Tomczyk	A1	W	wykład	aktywne
741def4e-b78e-4117-9952-5fea7e937d40	AwP4.0s1_EEs1	2026-06-16	10:15:00	45	Pomiary elektryczne wielkości nieelektrycznych	prof. K. Tomczyk	208B	L3	laboratoria	aktywne
f87dd1b1-d0bc-4f4a-b4d5-b0bed997f9f5	AwP4.0s1_EEs1	2026-06-16	12:00:00	45	Pomiary elektryczne wielkości nieelektrycznych	prof. K. Tomczyk / dr inż. M. Sieja	208B	L1	laboratoria	aktywne
2646c51a-acd4-4c3a-bbc2-b0ae629dd40e	AwP4.0s1_EEs1	2026-06-16	14:30:00	45	Inżynieria sterowania	dr inż. M. Pawlik	9	W	wykład	aktywne
270d0faa-a0e8-41e9-8a3d-11b9f6f8daae	AwP4.0s1_EEs1	2026-06-16	16:15:00	45	Inżynieria sterowania	dr inż. M. Pawlik	18	Lk1	laboratoria	aktywne
0a035866-b164-4f7e-abc6-5f3d0416aae6	AwP4.0s1_EEs1	2026-06-16	18:00:00	45	Inżynieria sterowania	dr inż. M. Pawlik	18	Lk2	laboratoria	aktywne
cb36c4c2-79dc-4656-bdb9-71398a79338f	AwP4.0s1_EEs1	2026-06-16	19:45:00	45	Mikrokontrolery i sterowniki programowalne	dr inż. S. Żaba	06	P2	laboratoria	aktywne
5197c52c-1bee-4644-8118-ed475690d94a	AwP4.0s1_EEs1_Its1	2026-02-25	14:30:00	90	Instruktaż BHP	prof. W. Drozd	MsTeams	W	wykład	aktywne
bca3a19c-6bf3-4979-9664-2a42b28e0c49	AwP4.0s1_EEs1_Its1	2026-04-01	07:00:00	900	Przerwa świąteczna	Brak	-	Wszystkie grupy	święto	wolne
917e54ac-e99b-465d-8278-f56ce23e2669	AwP4.0s1_EEs1_Its1	2026-04-02	07:00:00	900	Przerwa świąteczna	Brak	-	Wszystkie grupy	święto	wolne
6302060c-5603-4a10-8881-4be6ed8171f1	AwP4.0s1_EEs1_Its1	2026-04-03	07:00:00	900	Przerwa świąteczna	Brak	-	Wszystkie grupy	święto	wolne
9afa7a1d-ea9e-415d-befd-91ac72570c5b	AwP4.0s1_EEs1_Its1	2026-04-04	07:00:00	900	Przerwa świąteczna	Brak	-	Wszystkie grupy	święto	wolne
f0ff6706-8f2b-4260-a8f6-792c429c2072	AwP4.0s1_EEs1_Its1	2026-04-05	07:00:00	900	Przerwa świąteczna	Brak	-	Wszystkie grupy	święto	wolne
a0185f79-a4ca-42fa-bd2d-dd15465cc5cf	AwP4.0s1_EEs1_Its1	2026-04-06	07:00:00	900	Przerwa świąteczna	Brak	-	Wszystkie grupy	święto	wolne
7c6e8615-5f74-4ef1-804c-fd10ddf9c3f7	AwP4.0s1_EEs1_Its1	2026-04-07	07:00:00	900	Przerwa świąteczna	Brak	-	Wszystkie grupy	święto	wolne
6a8b63fc-d362-4e9b-a81c-a4b827c35db8	AwP4.0s1_EEs1_Its1	2026-05-01	07:00:00	900	Majówka	Brak	-	Wszystkie grupy	święto	wolne
01e53c8a-754f-4887-983d-2572c2c5e523	AwP4.0s1_EEs1_Its1	2026-05-02	07:00:00	900	Majówka	Brak	-	Wszystkie grupy	święto	wolne
37df61cb-05e7-4998-9849-c63cafcac63f	AwP4.0s1_EEs1_Its1	2026-05-03	07:00:00	900	Majówka	Brak	-	Wszystkie grupy	święto	wolne
944d7dc6-f0a9-4fa8-8d28-fbcfb2305384	AwP4.0s1_EEs1_Its1	2026-05-04	07:00:00	900	Majówka	Brak	-	Wszystkie grupy	święto	wolne
c5f72101-d4bb-4369-8368-47af86a77f1e	AwP4.0s1_EEs1_Its1	2026-05-12	07:00:00	900	Święto Szkoły	Brak	-	Wszystkie grupy	święto	wolne
66912fe8-98d5-4703-81f8-5c2931b7273c	AwP4.0s1_EEs1_Its1	2026-05-24	07:00:00	900	Zielone Świątki	Brak	-	Wszystkie grupy	święto	wolne
64834fa7-37fd-47f0-bab5-97d40b61197a	AwP4.0s1_EEs1_Its1	2026-06-04	07:00:00	900	Boże Ciało	Brak	-	Wszystkie grupy	święto	wolne
318ce16b-8f60-4cd8-ae56-c2d1002a1086	AwP4.0s1_EEs1_Its1	2026-06-05	07:00:00	900	Boże Ciało	Brak	-	Wszystkie grupy	święto	wolne
51035289-e707-412a-ae8a-2948f4f5d1ca	AwP4.0s3	2026-02-23	07:30:00	90	Sieci automatyki przemysłowej	dr inż. M. Pawlik	11	L1	laboratoria	aktywne
cbacf2d8-1fd5-4ab4-a4a7-051f06b70437	AwP4.0s3	2026-02-23	09:15:00	90	Sieci automatyki przemysłowej	dr inż. M. Pawlik	11	L2	laboratoria	aktywne
ced73821-a541-4dc1-a681-944d80b9d1a8	AwP4.0s3	2026-02-23	11:00:00	90	Sieci automatyki przemysłowej	dr inż. M. Pawlik	9	W	wykład	aktywne
8a8ba2c6-7fbd-4902-af95-3e455f4ef69a	AwP4.0s3	2026-02-24	09:15:00	135	Drgania w diagnostyce maszyn i urządzeń	prof. Ł. Ścisło	10	W	wykład	aktywne
bf7a16ad-6aeb-44aa-92b8-9758df10946f	AwP4.0s3	2026-02-24	16:15:00	90	Drgania w diagnostyce maszyn i urządzeń	prof. Ł. Ścisło	11	L2	laboratoria	aktywne
1759bb89-bd72-4500-9010-683f5e76ab38	AwP4.0s3	2026-02-25	12:45:00	90	Drgania w diagnostyce maszyn i urządzeń	prof. Ł. Ścisło	11	L1	laboratoria	aktywne
6dcd70d3-1708-4677-8d08-5f70b76864a3	AwP4.0s3	2026-03-02	07:30:00	90	Sieci automatyki przemysłowej	dr inż. M. Pawlik	11	L1	laboratoria	aktywne
1e3c2331-a94a-4a05-a9aa-59d89357bbe0	AwP4.0s3	2026-03-02	09:15:00	90	Sieci automatyki przemysłowej	dr inż. M. Pawlik	11	L2	laboratoria	aktywne
318e73c3-c217-4544-8625-0f37b77f3d39	AwP4.0s3	2026-03-02	11:00:00	90	Sieci automatyki przemysłowej	dr inż. M. Pawlik	9	W	wykład	aktywne
1052c1ad-2285-447d-bfcb-942739c4021d	AwP4.0s3	2026-03-03	09:15:00	135	Seminarium dyplomowe	prof. Ł. Ścisło	10	S1	laboratoria	aktywne
dfe25292-42fc-4f65-9d0a-3fb50e87547f	AwP4.0s3	2026-03-03	11:45:00	135	Wybrane źródła finansowania rozwoju przedsiębiorstw	dr M. Mikulec	A1	S1	laboratoria	aktywne
27938605-8b98-41fd-8932-b14334a98738	AwP4.0s3	2026-03-03	16:15:00	90	Drgania w diagnostyce maszyn i urządzeń	prof. Ł. Ścisło	11	L2	laboratoria	aktywne
075de5b0-8437-4839-b8bf-f55f1432c005	AwP4.0s3	2026-03-04	12:45:00	90	Drgania w diagnostyce maszyn i urządzeń	prof. Ł. Ścisło	11	L1	laboratoria	aktywne
c3415236-deb8-436a-a1e7-3ea3076e0d24	AwP4.0s3	2026-03-09	07:30:00	90	Sieci automatyki przemysłowej	dr inż. M. Pawlik	11	L1	laboratoria	aktywne
1f3517ae-a117-4ba8-bc3a-11a753952227	AwP4.0s3	2026-03-09	09:15:00	90	Sieci automatyki przemysłowej	dr inż. M. Pawlik	11	L2	laboratoria	aktywne
30a65721-420f-42f9-a8e0-b063dfcc5e0e	AwP4.0s3	2026-03-09	11:00:00	90	Sieci automatyki przemysłowej	dr inż. M. Pawlik	9	W	wykład	aktywne
b9c95341-db1d-4a16-a151-7cb065b63a47	AwP4.0s3	2026-03-10	09:15:00	90	Drgania w diagnostyce maszyn i urządzeń	prof. Ł. Ścisło	10	W	wykład	aktywne
e538e9e5-179d-4464-aaaa-d198d12da558	AwP4.0s3	2026-03-10	11:45:00	135	Wybrane źródła finansowania rozwoju przedsiębiorstw	dr M. Mikulec	A1	S1	laboratoria	aktywne
d3791f3a-8565-44f6-821f-e10608b78bb5	AwP4.0s3	2026-03-10	16:15:00	90	Drgania w diagnostyce maszyn i urządzeń	prof. Ł. Ścisło	11	L2	laboratoria	aktywne
8bc0400e-c280-4a3c-9393-581099556166	AwP4.0s3	2026-03-11	12:45:00	90	Drgania w diagnostyce maszyn i urządzeń	prof. Ł. Ścisło	11	L1	laboratoria	aktywne
c5d829e8-447d-4158-9ba0-7b5202df82cd	AwP4.0s3	2026-03-16	07:30:00	90	Sieci automatyki przemysłowej	dr inż. M. Pawlik	11	L1	laboratoria	aktywne
8b4e3740-803f-4d3b-9ec8-83b009a088ac	AwP4.0s3	2026-03-16	09:15:00	90	Sieci automatyki przemysłowej	dr inż. M. Pawlik	11	L2	laboratoria	aktywne
e386454a-f2a8-4f1f-80a2-47df76219744	AwP4.0s3	2026-03-16	11:00:00	90	Sieci automatyki przemysłowej	dr inż. M. Pawlik	9	W	wykład	aktywne
aab76f85-405e-4cf7-8ab2-aac17d17da11	AwP4.0s3	2026-03-17	09:15:00	135	Seminarium dyplomowe	prof. Ł. Ścisło	10	S1	laboratoria	aktywne
04eb26ea-8b06-461c-9be8-03bead5d26c9	AwP4.0s3	2026-03-17	11:45:00	135	Wybrane źródła finansowania rozwoju przedsiębiorstw	dr M. Mikulec	A1	S1	laboratoria	aktywne
532097cd-aa09-4b9f-b8f6-95750c784f22	AwP4.0s3	2026-03-17	16:15:00	90	Drgania w diagnostyce maszyn i urządzeń	prof. Ł. Ścisło	11	L2	laboratoria	aktywne
35e99818-bee2-485b-883d-1d53d41ea606	AwP4.0s3	2026-03-18	12:45:00	90	Drgania w diagnostyce maszyn i urządzeń	prof. Ł. Ścisło	11	L1	laboratoria	aktywne
46d596bd-6a67-4063-8fba-f332a279d053	AwP4.0s3	2026-03-23	07:30:00	90	Sieci automatyki przemysłowej	dr inż. M. Pawlik	11	L1	laboratoria	aktywne
f96fd177-a27f-4b0d-9c1c-245fbabf91ab	AwP4.0s3	2026-03-23	09:15:00	90	Sieci automatyki przemysłowej	dr inż. M. Pawlik	11	L2	laboratoria	aktywne
c0e34aa5-daef-4210-bedf-dcea9a7cb84e	AwP4.0s3	2026-03-23	11:00:00	90	Sieci automatyki przemysłowej	dr inż. M. Pawlik	9	W	wykład	aktywne
10c383db-e471-4763-a0ea-30f982b08125	AwP4.0s3	2026-03-24	09:15:00	90	Drgania w diagnostyce maszyn i urządzeń	prof. Ł. Ścisło	10	W	wykład	aktywne
b3860c85-e45d-4f87-9a04-3490c46ff18f	AwP4.0s3	2026-03-24	11:45:00	135	Wybrane źródła finansowania rozwoju przedsiębiorstw	dr M. Mikulec	A1	S1	laboratoria	aktywne
7ce6f84c-a367-4ad4-aa54-3a7cd78cae23	AwP4.0s3	2026-03-24	16:15:00	90	Drgania w diagnostyce maszyn i urządzeń	prof. Ł. Ścisło	11	L2	laboratoria	aktywne
49fc9b41-d138-4b74-a84b-5daf092a4805	AwP4.0s3	2026-03-25	12:45:00	90	Drgania w diagnostyce maszyn i urządzeń	prof. Ł. Ścisło	11	L1	laboratoria	aktywne
a0170dc8-5c76-4228-b345-d4454fb0a26d	AwP4.0s3	2026-03-30	07:30:00	90	Sieci automatyki przemysłowej	dr inż. M. Pawlik	11	L1	laboratoria	aktywne
cbca542f-16ec-4030-b122-8669867a65d7	AwP4.0s3	2026-03-30	09:15:00	90	Sieci automatyki przemysłowej	dr inż. M. Pawlik	11	L2	laboratoria	aktywne
32d75093-5742-40c1-9d1a-d1b34dabad62	AwP4.0s3	2026-03-30	11:00:00	90	Sieci automatyki przemysłowej	dr inż. M. Pawlik	9	W	wykład	aktywne
1d5284ee-1164-4ecb-8171-10346dd09fc9	AwP4.0s3	2026-03-31	09:15:00	90	Seminarium dyplomowe	prof. Ł. Ścisło	10	S1	laboratoria	aktywne
507354d3-282e-4349-b625-891c7f5b854c	AwP4.0s3	2026-03-31	11:45:00	135	Wybrane źródła finansowania rozwoju przedsiębiorstw	dr M. Mikulec	A1	S1	laboratoria	aktywne
59ace67d-0740-4c0d-8591-7e574d3039f5	AwP4.0s3	2026-03-31	16:15:00	90	Drgania w diagnostyce maszyn i urządzeń	prof. Ł. Ścisło	11	L2	laboratoria	aktywne
18492084-ad85-4839-8b03-0cfe98afd474	AwP4.0s3	2026-04-01	07:00:00	900	Przerwa świąteczna	Brak	-	Wszystkie grupy	święto	wolne
b3178cf5-736d-4775-bea4-6f10d5b3e912	AwP4.0s3	2026-04-02	07:00:00	900	Przerwa świąteczna	Brak	-	Wszystkie grupy	święto	wolne
e829326f-f718-4fd1-841c-a3e141ad8850	AwP4.0s3	2026-04-03	07:00:00	900	Przerwa świąteczna	Brak	-	Wszystkie grupy	święto	wolne
ac7e6f8f-7f3a-4f03-96ca-7d59c0d5bb20	AwP4.0s3	2026-04-04	07:00:00	900	Przerwa świąteczna	Brak	-	Wszystkie grupy	święto	wolne
a7346a2e-8e0f-45a1-af83-ef51928c689c	AwP4.0s3	2026-04-05	07:00:00	900	Przerwa świąteczna	Brak	-	Wszystkie grupy	święto	wolne
93ac2d50-481a-4a62-a1a3-185bf9e592cc	AwP4.0s3	2026-04-06	07:00:00	900	Przerwa świąteczna	Brak	-	Wszystkie grupy	święto	wolne
55d7d217-490e-4a8c-a1ca-6f88de990333	AwP4.0s3	2026-04-07	07:00:00	900	Przerwa świąteczna	Brak	-	Wszystkie grupy	święto	wolne
78d1672b-a0cb-4e00-8378-a2727662ad00	AwP4.0s3	2026-04-08	12:45:00	90	Drgania w diagnostyce maszyn i urządzeń	prof. Ł. Ścisło	11	L1	laboratoria	aktywne
535969f4-d707-4d4d-bf68-4370a3bc4ca6	AwP4.0s3	2026-04-13	07:30:00	90	Sieci automatyki przemysłowej	dr inż. M. Pawlik	11	L1	laboratoria	aktywne
2ce5b18c-4129-4755-98f9-2b0d2cbd8282	AwP4.0s3	2026-04-13	09:15:00	90	Sieci automatyki przemysłowej	dr inż. M. Pawlik	11	L2	laboratoria	aktywne
b692efba-4225-48e5-978e-c23c6d742293	AwP4.0s3	2026-04-13	11:00:00	90	Sieci automatyki przemysłowej	dr inż. M. Pawlik	9	W	wykład	aktywne
b0822f80-01f2-4cd3-860e-9936b8905b5b	AwP4.0s3	2026-04-14	09:15:00	90	Seminarium dyplomowe	prof. Ł. Ścisło	10	S1	laboratoria	aktywne
dbb49db0-62c8-47a8-bc4e-a170adedc65b	AwP4.0s3	2026-04-14	16:15:00	90	Drgania w diagnostyce maszyn i urządzeń	prof. Ł. Ścisło	11	L2	laboratoria	aktywne
30250281-9741-46bf-9bb8-3941bcb51ff9	AwP4.0s3	2026-04-15	12:45:00	90	Drgania w diagnostyce maszyn i urządzeń	prof. Ł. Ścisło	11	L1	laboratoria	aktywne
11404dac-996a-4c07-9cf2-02b843f6d40c	AwP4.0s3	2026-04-20	07:30:00	90	Sieci automatyki przemysłowej	dr inż. M. Pawlik	11	L1	laboratoria	aktywne
97d2935f-43c1-4fd5-9a65-cdbf58eaf1c7	AwP4.0s3	2026-04-20	09:15:00	90	Sieci automatyki przemysłowej	dr inż. M. Pawlik	11	L2	laboratoria	aktywne
28cb3be0-9383-4154-9c38-c8c6fd11618c	AwP4.0s3	2026-04-20	11:00:00	45	Sieci automatyki przemysłowej	dr inż. M. Pawlik	9	W	wykład	aktywne
f4de4dce-2b11-4f9a-a68a-5149f6912463	AwP4.0s3	2026-04-21	09:15:00	90	Drgania w diagnostyce maszyn i urządzeń	prof. Ł. Ścisło	10	W	wykład	aktywne
c28cf2cf-9ce0-4c49-8ca7-ea136e4ed5f2	AwP4.0s3	2026-04-21	16:15:00	90	Drgania w diagnostyce maszyn i urządzeń	prof. Ł. Ścisło	11	L2	laboratoria	aktywne
f78b84e8-1d96-402c-b623-6521e3ce96f3	AwP4.0s3	2026-04-22	12:45:00	90	Drgania w diagnostyce maszyn i urządzeń	prof. Ł. Ścisło	11	L1	laboratoria	aktywne
cadfc0c4-fb8f-4be2-949e-a8eac6155b6a	AwP4.0s3	2026-04-27	07:30:00	90	Sieci automatyki przemysłowej	dr inż. M. Pawlik	11	L1	laboratoria	aktywne
d8311524-c05e-441a-92e5-d37ac82c74e5	AwP4.0s3	2026-04-27	09:15:00	90	Sieci automatyki przemysłowej	dr inż. M. Pawlik	11	L2	laboratoria	aktywne
d8b6b49e-6a41-453e-8229-4b3d291e29bf	AwP4.0s3	2026-04-28	09:15:00	135	Seminarium dyplomowe	prof. Ł. Ścisło	10	S1	laboratoria	aktywne
07c2d085-a51e-4bb2-bf63-f8cf5d8f125f	AwP4.0s3	2026-04-28	16:15:00	90	Drgania w diagnostyce maszyn i urządzeń	prof. Ł. Ścisło	11	L2	laboratoria	aktywne
7285acf4-712a-460d-ab2b-16887e861908	AwP4.0s3	2026-04-29	12:45:00	90	Drgania w diagnostyce maszyn i urządzeń	prof. Ł. Ścisło	11	L1	laboratoria	aktywne
d0bd6ba3-490e-4dad-bc81-995747dcc808	AwP4.0s3	2026-05-01	07:00:00	900	Majówka	Brak	-	Wszystkie grupy	święto	wolne
81cddc3b-99ce-45af-b311-0506f3a9d3eb	AwP4.0s3	2026-05-02	07:00:00	900	Majówka	Brak	-	Wszystkie grupy	święto	wolne
57e2a6b0-07b9-45cc-975a-b58cb91f4e19	AwP4.0s3	2026-05-03	07:00:00	900	Majówka	Brak	-	Wszystkie grupy	święto	wolne
e8acaf5b-f1ec-4c27-8e1b-1b9ef5ee2488	AwP4.0s3	2026-05-04	07:00:00	900	Majówka	Brak	-	Wszystkie grupy	święto	wolne
b3b40162-0632-4846-876a-f48b66492492	AwP4.0s3	2026-05-05	09:15:00	90	Drgania w diagnostyce maszyn i urządzeń	prof. Ł. Ścisło	10	W	wykład	aktywne
a4318c89-7f51-4a80-8006-d31e17675c13	AwP4.0s3	2026-05-05	16:15:00	90	Drgania w diagnostyce maszyn i urządzeń	prof. Ł. Ścisło	11	L2	laboratoria	aktywne
b68d444f-fcb4-4796-9544-38a7f22f9a5a	AwP4.0s3	2026-05-06	12:45:00	90	Drgania w diagnostyce maszyn i urządzeń	prof. Ł. Ścisło	11	L1	laboratoria	aktywne
be6d44ad-1f09-4791-9d1a-5a01994d016b	AwP4.0s3	2026-05-11	07:30:00	90	Sieci automatyki przemysłowej	dr inż. M. Pawlik	11	L1	laboratoria	aktywne
36d6b6f4-d003-4414-92c1-47dbc854fc40	AwP4.0s3	2026-05-11	09:15:00	90	Sieci automatyki przemysłowej	dr inż. M. Pawlik	11	L2	laboratoria	aktywne
d780e6ca-536e-44f0-abbf-825994aa9f6e	AwP4.0s3	2026-05-12	07:00:00	900	Święto Szkoły	Brak	-	Wszystkie grupy	święto	wolne
e2a88823-a2a8-4dce-a29a-79f8006d7750	AwP4.0s3	2026-05-19	09:15:00	90	Drgania w diagnostyce maszyn i urządzeń	prof. Ł. Ścisło	10	W	wykład	aktywne
8b6c20a7-e0ba-45b4-8ef8-dfe6c5b435c8	AwP4.0s3	2026-05-24	07:00:00	900	Zielone Świątki	Brak	-	Wszystkie grupy	święto	wolne
1df5b159-bbf2-4532-94b4-f692a0e8cf09	AwP4.0s3	2026-06-04	07:00:00	900	Boże Ciało	Brak	-	Wszystkie grupy	święto	wolne
82195f64-e8ac-441d-bac0-41468bf927f0	AwP4.0s3	2026-06-05	07:00:00	900	Boże Ciało	Brak	-	Wszystkie grupy	święto	wolne
48ef45fd-3467-4291-a11a-4f951aa872df	AwP4.0s3_EEs3	2026-02-25	18:00:00	90	Metody i zastosowania sztucznej inteligencji	dr inż. M. Dudzik	WA2	Lk1	laboratoria	aktywne
8268a458-1224-4e70-87fc-d3e7c434ad5f	AwP4.0s3_EEs3	2026-02-25	19:45:00	90	Metody i zastosowania sztucznej inteligencji	dr inż. M. Dudzik	WA2	Lk2	laboratoria	aktywne
5104955c-cedb-4293-b15b-8a58916faf08	EEs1	2026-05-21	10:15:00	135	Technika wysokich napięć	dr inż. D. Smugała	010A	L4	laboratoria	aktywne
a9e44b11-52d9-456b-bae0-e7841a5a8bfc	AwP4.0s3_EEs3	2026-02-26	18:00:00	135	Metody i zastosowania sztucznej inteligencji	dr inż. M. Dudzik	WA2	W	wykład	aktywne
1b957b33-c85a-4e48-b406-171aa5205215	AwP4.0s3_EEs3	2026-03-04	18:00:00	90	Metody i zastosowania sztucznej inteligencji	dr inż. M. Dudzik	WA2	Lk1	laboratoria	aktywne
0690706b-743a-457d-b29a-8fc0d4b016de	AwP4.0s3_EEs3	2026-03-04	19:45:00	90	Metody i zastosowania sztucznej inteligencji	dr inż. M. Dudzik	WA2	Lk2	laboratoria	aktywne
ccb7bf46-26dc-47a7-8d7a-8209ea52e0a2	AwP4.0s3_EEs3	2026-03-10	18:00:00	135	Metody i zastosowania sztucznej inteligencji	dr inż. M. Dudzik	WA2	W	wykład	aktywne
eaa2a84a-6f5c-4eba-9fca-70a3b8037029	AwP4.0s3_EEs3	2026-03-11	18:00:00	90	Metody i zastosowania sztucznej inteligencji	dr inż. M. Dudzik	WA2	Lk1	laboratoria	aktywne
03ba4bf4-f451-4a42-b6e4-63b64ddf0eff	AwP4.0s3_EEs3	2026-03-11	19:45:00	90	Metody i zastosowania sztucznej inteligencji	dr inż. M. Dudzik	WA2	Lk2	laboratoria	aktywne
97bd5ed5-3726-45ea-aa15-59a394c7ca76	AwP4.0s3_EEs3	2026-03-18	18:00:00	90	Metody i zastosowania sztucznej inteligencji	dr inż. M. Dudzik	WA2	Lk1	laboratoria	aktywne
e36098c3-28b6-4ae9-ad51-17a2cc14402d	AwP4.0s3_EEs3	2026-03-18	19:45:00	90	Metody i zastosowania sztucznej inteligencji	dr inż. M. Dudzik	WA2	Lk2	laboratoria	aktywne
de41327c-3c1b-4624-9024-1cbc963a49a7	AwP4.0s3_EEs3	2026-03-24	18:00:00	135	Metody i zastosowania sztucznej inteligencji	dr inż. M. Dudzik	WA2	W	wykład	aktywne
cdcb7f8a-fe00-4344-af2b-692f8bbd0f09	AwP4.0s3_EEs3	2026-03-25	18:00:00	90	Metody i zastosowania sztucznej inteligencji	dr inż. M. Dudzik	WA2	Lk1	laboratoria	aktywne
ace7aff0-6e26-4901-81ec-e615bf6dbf43	AwP4.0s3_EEs3	2026-03-25	19:45:00	90	Metody i zastosowania sztucznej inteligencji	dr inż. M. Dudzik	WA2	Lk2	laboratoria	aktywne
3ab26558-96a7-4947-ad40-07f3800b45cf	AwP4.0s3_EEs3	2026-04-01	07:00:00	900	Przerwa świąteczna	Brak	-	Wszystkie grupy	święto	wolne
43776936-c511-4fa8-a999-8048a51d9c56	AwP4.0s3_EEs3	2026-04-02	07:00:00	900	Przerwa świąteczna	Brak	-	Wszystkie grupy	święto	wolne
12eb3836-1227-437b-b54c-a7fbea4dc448	AwP4.0s3_EEs3	2026-04-03	07:00:00	900	Przerwa świąteczna	Brak	-	Wszystkie grupy	święto	wolne
9f5ae5ac-9aab-4c19-944c-f3316eec6982	AwP4.0s3_EEs3	2026-04-04	07:00:00	900	Przerwa świąteczna	Brak	-	Wszystkie grupy	święto	wolne
122e4f31-0090-4022-90d1-eab46338ca72	AwP4.0s3_EEs3	2026-04-05	07:00:00	900	Przerwa świąteczna	Brak	-	Wszystkie grupy	święto	wolne
7e1a98b8-28d1-45b4-bf67-84dadf4831d3	AwP4.0s3_EEs3	2026-04-06	07:00:00	900	Przerwa świąteczna	Brak	-	Wszystkie grupy	święto	wolne
64862f92-2920-4bda-9b0e-301d4b2c0541	AwP4.0s3_EEs3	2026-04-07	07:00:00	900	Przerwa świąteczna	Brak	-	Wszystkie grupy	święto	wolne
c240ee06-4819-4546-8f6b-5c56f5ab695f	AwP4.0s3_EEs3	2026-04-08	18:00:00	90	Metody i zastosowania sztucznej inteligencji	dr inż. M. Dudzik	WA2	Lk1	laboratoria	aktywne
7d75f04b-9952-4b73-a435-49b8f11991e5	AwP4.0s3_EEs3	2026-04-08	19:45:00	90	Metody i zastosowania sztucznej inteligencji	dr inż. M. Dudzik	WA2	Lk2	laboratoria	aktywne
11638b8f-0c60-4202-b94c-c652bc376c7c	AwP4.0s3_EEs3	2026-04-15	18:00:00	90	Metody i zastosowania sztucznej inteligencji	dr inż. M. Dudzik	WA2	Lk1	laboratoria	aktywne
3cea6815-e35c-4409-a65b-1ca8f1c73c34	AwP4.0s3_EEs3	2026-04-15	19:45:00	90	Metody i zastosowania sztucznej inteligencji	dr inż. M. Dudzik	WA2	Lk2	laboratoria	aktywne
b8520e4b-261b-495b-aea3-a38a3d31675b	AwP4.0s3_EEs3	2026-04-21	18:00:00	135	Metody i zastosowania sztucznej inteligencji	dr inż. M. Dudzik	WA2	W	wykład	aktywne
20fe13d6-a4c5-48be-a6c8-af63d3893c95	AwP4.0s3_EEs3	2026-05-01	07:00:00	900	Majówka	Brak	-	Wszystkie grupy	święto	wolne
1f596dd2-a610-4db7-a268-8817238a6516	AwP4.0s3_EEs3	2026-05-02	07:00:00	900	Majówka	Brak	-	Wszystkie grupy	święto	wolne
d3c14f99-9f92-4c4a-916f-33d42826d09c	AwP4.0s3_EEs3	2026-05-03	07:00:00	900	Majówka	Brak	-	Wszystkie grupy	święto	wolne
79995a10-5cee-410b-8f6a-40575d1d44a6	AwP4.0s3_EEs3	2026-05-04	07:00:00	900	Majówka	Brak	-	Wszystkie grupy	święto	wolne
ec44bb0f-d9cf-4d25-a8a3-4072ce907620	AwP4.0s3_EEs3	2026-05-05	18:00:00	135	Metody i zastosowania sztucznej inteligencji	dr inż. M. Dudzik	WA2	W	wykład	aktywne
4d12ee15-c225-4ca5-8fbc-3145f62fc6fb	AwP4.0s3_EEs3	2026-05-12	07:00:00	900	Święto Szkoły	Brak	-	Wszystkie grupy	święto	wolne
58c7d378-607e-4e81-9c08-4ad95b1906d6	AwP4.0s3_EEs3	2026-05-24	07:00:00	900	Zielone Świątki	Brak	-	Wszystkie grupy	święto	wolne
1282ead8-34ef-49f7-9357-7df36b076e26	AwP4.0s3_EEs3	2026-06-04	07:00:00	900	Boże Ciało	Brak	-	Wszystkie grupy	święto	wolne
95d9f4c6-da6f-456a-994c-89f4b820f8b6	AwP4.0s3_EEs3	2026-06-05	07:00:00	900	Boże Ciało	Brak	-	Wszystkie grupy	święto	wolne
a5fa950a-823b-4a76-9cde-d6e85b30c10d	EEs1	2026-02-23	11:00:00	90	Systemy generacji i przetwarzania energii elektrycznej	prof. M. Jaraczewski	13	Lk2E	laboratoria	aktywne
1d7b1847-f721-45c6-a0cf-ba765df53df0	EEs1	2026-02-23	12:45:00	90	Systemy generacji i przetwarzania energii elektrycznej	prof. M. Jaraczewski	13	P2E	laboratoria	aktywne
9f3b9774-42d1-4354-a232-313727255f29	EEs1	2026-02-23	14:30:00	90	Język niemiecki	mgr E. Targosz	139SJO	Lek	laboratoria	aktywne
9cf3d983-877b-4a7e-bf31-4733dfb86c62	EEs1	2026-02-25	11:45:00	90	Modelowanie układów elektromagnetycznych	prof. A. Warzecha	9	W	wykład	aktywne
fd95438b-29cd-4e73-98f4-09dd93b21512	EEs1	2026-02-25	16:15:00	90	Systemy generacji i przetwarzania energii elektrycznej	prof. A. Warzecha	10	W	wykład	aktywne
b9b4356d-d49c-47d6-8b87-2adf5545df07	EEs1	2026-02-26	08:30:00	90	Komputerowe projektowanie urządzeń dla elektroenergetyki	mgr inż. S. Nachman	13	Lk2E	laboratoria	aktywne
1edf1812-da06-4460-a626-8b5731b72016	EEs1	2026-02-26	11:00:00	90	Język angielski	mgr J. Firganek	139SJO	Lek1	laboratoria	aktywne
942cdfc1-137b-41a8-8986-f72a8a0ea806	EEs1	2026-02-26	12:45:00	90	Systemy generacji i przetwarzania energii elektrycznej	prof. W. Mazgaj	A2	W	wykład	aktywne
4da35130-96b7-4059-8c43-cde7768752b0	EEs1	2026-02-26	16:15:00	90	Modelowanie układów elektromagnetycznych	dr inż. M. Sierżęga	A2	W / C	wykład	aktywne
e529a83e-9989-4576-86ab-82a7071c2a54	EEs1	2026-02-27	10:00:00	180	Projektowanie instalacji elektrycznych	dr inż. Ł. Sołtysek_	MsTeams	W / C / K / P	wykład	aktywne
0363c747-01db-4b26-9e3f-bfeea6978a32	EEs1	2026-03-02	14:30:00	90	Język niemiecki	mgr E. Targosz	139SJO	Lek	laboratoria	aktywne
c68b1a2d-3bad-477c-8d6b-79256b5572e2	EEs1	2026-03-04	11:45:00	90	Zakłócenia w układach elektroenergetycznych	prof. J. Szczepanik	9	W	wykład	aktywne
f29a570d-b7c9-4142-a055-db3d38151576	EEs1	2026-03-04	13:30:00	90	Zakłócenia w układach elektroenergetycznych	prof. J. Szczepanik	12	Lk2E	laboratoria	aktywne
0cda6fa4-6def-41fb-8d2a-09eac6e233f6	EEs1	2026-03-04	16:15:00	90	Systemy generacji i przetwarzania energii elektrycznej	prof. A. Warzecha	10	W	wykład	aktywne
1a6a43d4-121c-4762-86e1-c82d8b66190a	EEs1	2026-03-04	18:00:00	90	Modelowanie układów elektromagnetycznych	dr inż. N. Radwan-Pragłowska	13	Lk3E	laboratoria	aktywne
82f0aa8a-3395-499d-8b36-a6d5480f4848	EEs1	2026-03-05	08:30:00	90	Komputerowe projektowanie urządzeń dla elektroenergetyki	mgr inż. S. Nachman	13	Lk2E	laboratoria	aktywne
8fbe3993-dfe4-4a59-857a-65e715beed0a	EEs1	2026-03-05	11:00:00	90	Język angielski	mgr J. Firganek	139SJO	Lek1	laboratoria	aktywne
3fc9e668-a163-458d-9ea7-bbdd9ad8cd79	EEs1	2026-03-05	12:45:00	90	Systemy generacji i przetwarzania energii elektrycznej	prof. W. Mazgaj	A2	W	wykład	aktywne
b86fa3c8-f0bc-4ce1-a05c-3ca2c13b3402	EEs1	2026-03-05	16:15:00	90	Modelowanie układów elektromagnetycznych	dr inż. M. Sierżęga	A2	W / C	wykład	aktywne
c62e29a3-54f2-4771-acc3-07e36ef4ef72	EEs1	2026-03-06	10:00:00	180	Projektowanie instalacji elektrycznych	dr inż. Ł. Sołtysek_	MsTeams	W / C / K / P	wykład	aktywne
78d31aa2-7a19-4d66-ab1e-7694950f7a03	EEs1	2026-03-09	11:00:00	90	Systemy generacji i przetwarzania energii elektrycznej	prof. M. Jaraczewski	13	Lk2E	laboratoria	aktywne
0dd165b8-772d-43e9-9181-2c2f82eb2003	EEs1	2026-03-09	12:45:00	90	Systemy generacji i przetwarzania energii elektrycznej	prof. M. Jaraczewski	13	P2E	laboratoria	aktywne
24005054-ad27-49f5-808f-9e247a6f2ed3	EEs1	2026-03-09	14:30:00	90	Język niemiecki	mgr E. Targosz	139SJO	Lek	laboratoria	aktywne
d024ee04-0223-46b3-b252-55c9f3e66884	EEs1	2026-03-09	18:00:00	90	Modelowanie układów elektromagnetycznych	dr inż. N. Radwan-Pragłowska	A1	W	wykład	aktywne
4da133c2-3a96-46d5-b809-36e0f31fd4d1	EEs1	2026-03-11	11:45:00	90	Modelowanie układów elektromagnetycznych	prof. A. Warzecha	9	W	wykład	aktywne
456251f5-0d71-4b94-bbff-29e6dcec82b0	EEs1	2026-03-11	13:30:00	90	Zakłócenia w układach elektroenergetycznych	prof. J. Szczepanik	8	L3	laboratoria	aktywne
20ca3b75-8cfe-43f7-be70-c3aacbdd66fd	EEs1	2026-03-11	16:15:00	90	Systemy generacji i przetwarzania energii elektrycznej	prof. A. Warzecha	10	W	wykład	aktywne
b83c41e8-88a0-4e83-a9d2-7c044bae5a04	EEs1	2026-03-11	18:00:00	90	Modelowanie układów elektromagnetycznych	dr inż. N. Radwan-Pragłowska	13	Lk3E	laboratoria	aktywne
ee110b04-ee94-4457-a35d-b45f5c2adc85	EEs1	2026-03-12	08:30:00	90	Komputerowe projektowanie urządzeń dla elektroenergetyki	mgr inż. S. Nachman	13	Lk2E	laboratoria	aktywne
8afe5950-3a93-4601-b814-948db807cef5	EEs1	2026-03-12	11:00:00	90	Język angielski	mgr J. Firganek	139SJO	Lek1	laboratoria	aktywne
8a08ef05-87c2-49d8-bd00-0957114f67d1	EEs1	2026-03-12	12:45:00	90	Systemy generacji i przetwarzania energii elektrycznej	prof. W. Mazgaj	A2	W	wykład	aktywne
f8107ddc-4b01-4a46-8365-77a98d6b2703	EEs1	2026-03-12	16:15:00	90	Modelowanie układów elektromagnetycznych	dr inż. M. Sierżęga	A2	W / C	wykład	aktywne
4d55bcf0-ffbd-4658-9d02-6239341f88e5	EEs1	2026-03-13	10:00:00	180	Projektowanie instalacji elektrycznych	dr inż. Ł. Sołtysek_	MsTeams	W / C / K / P	wykład	aktywne
cf03d4fc-3bfd-41d1-a448-4412d1c13a04	EEs1	2026-03-16	14:30:00	90	Język niemiecki	mgr E. Targosz	139SJO	Lek	laboratoria	aktywne
514fc566-618e-4830-a865-8f3c76d0560f	EEs1	2026-03-18	11:45:00	90	Zakłócenia w układach elektroenergetycznych	prof. J. Szczepanik	9	W	wykład	aktywne
e07566b2-fb72-4cd1-80ef-0d9246e32029	EEs1	2026-03-18	13:30:00	90	Zakłócenia w układach elektroenergetycznych	prof. J. Szczepanik	8	L4	laboratoria	aktywne
9e504fa6-ab92-4842-babb-565670d769c6	EEs1	2026-03-18	16:15:00	90	Systemy generacji i przetwarzania energii elektrycznej	prof. A. Warzecha	10	W	wykład	aktywne
6591e839-5ed1-4d4c-a991-58c84a165246	EEs1	2026-03-18	18:00:00	90	Modelowanie układów elektromagnetycznych	dr inż. N. Radwan-Pragłowska	13	Lk3E	laboratoria	aktywne
68a6a240-6e47-4bec-98ea-1fdc754e1468	EEs1	2026-03-19	08:30:00	90	Komputerowe projektowanie urządzeń dla elektroenergetyki	mgr inż. S. Nachman	13	Lk2E	laboratoria	aktywne
763b42fa-9fd2-485a-9a81-03bbbdbd2500	EEs1	2026-03-19	11:00:00	90	Język angielski	mgr J. Firganek	139SJO	Lek1	laboratoria	aktywne
09bbf1e5-37aa-4367-931e-38bdf2fe057c	EEs1	2026-03-19	16:15:00	90	Modelowanie układów elektromagnetycznych	dr inż. M. Sierżęga	A2	W / C	wykład	aktywne
45bf8cb2-1b99-4e82-8be1-32c54db3372c	EEs1	2026-03-20	10:00:00	180	Projektowanie instalacji elektrycznych	dr inż. Ł. Sołtysek_	MsTeams	W / C / K / P	wykład	aktywne
20590ae4-93cb-4a54-b4a2-f40979e69256	EEs1	2026-03-23	11:00:00	90	Systemy generacji i przetwarzania energii elektrycznej	prof. M. Jaraczewski	13	Lk2E	laboratoria	aktywne
ca91fd4d-0fd2-4fc6-9f66-8774afeb8bff	EEs1	2026-03-23	12:45:00	90	Systemy generacji i przetwarzania energii elektrycznej	prof. M. Jaraczewski	13	P2E	laboratoria	aktywne
8d790200-3c70-424d-b051-3f5666d217f5	EEs1	2026-03-23	14:30:00	90	Język niemiecki	mgr E. Targosz	139SJO	Lek	laboratoria	aktywne
0c977036-3346-4963-bbff-f2ee4b949237	EEs1	2026-03-23	18:00:00	90	Modelowanie układów elektromagnetycznych	dr inż. N. Radwan-Pragłowska	A1	W	wykład	aktywne
171aa181-54b2-41e1-9c8f-8099460b6fa2	EEs1	2026-03-25	11:45:00	90	Modelowanie układów elektromagnetycznych	prof. A. Warzecha	9	W	wykład	aktywne
112600e1-61b1-44cb-87de-d27847a4be53	EEs1	2026-03-25	13:30:00	90	Zakłócenia w układach elektroenergetycznych	prof. J. Szczepanik	12	Lk2E	laboratoria	aktywne
f70e7b0f-babd-494a-9447-c7a05f2d18df	EEs1	2026-03-25	16:15:00	90	Systemy generacji i przetwarzania energii elektrycznej	prof. A. Warzecha	10	W	wykład	aktywne
84d35f0b-cc81-473d-aff4-a1e16a50a4d2	EEs1	2026-03-25	18:00:00	90	Modelowanie układów elektromagnetycznych	dr inż. N. Radwan-Pragłowska	13	Lk3E	laboratoria	aktywne
51a8df60-847f-4c88-9205-3459ac11c531	EEs1	2026-03-26	08:30:00	90	Komputerowe projektowanie urządzeń dla elektroenergetyki	mgr inż. S. Nachman	13	Lk2E	laboratoria	aktywne
166c111d-c42c-4aab-89a8-3958fb257631	EEs1	2026-03-26	11:00:00	90	Język angielski	mgr J. Firganek	139SJO	Lek1	laboratoria	aktywne
80bbbf01-1912-4191-bf9b-a0c75cbad26c	EEs1	2026-03-26	16:15:00	90	Modelowanie układów elektromagnetycznych	dr inż. M. Sierżęga	A2	W / C	wykład	aktywne
318f76bd-58c4-4fb0-a52d-951aacb42ba6	EEs1	2026-03-27	10:00:00	180	Projektowanie instalacji elektrycznych	dr inż. Ł. Sołtysek_	MsTeams	W / C / K / P	wykład	aktywne
67f9e60d-0083-4cbf-8856-39c7a2a1f7c3	EEs1	2026-03-30	14:30:00	90	Język niemiecki	mgr E. Targosz	139SJO	Lek	laboratoria	aktywne
8553e1cf-c66d-4537-8024-3445ae64569b	EEs1	2026-04-01	07:00:00	900	Przerwa świąteczna	Brak	-	Wszystkie grupy	święto	wolne
26e76faf-185c-4ff3-afa8-ecdf73710f4f	EEs1	2026-04-02	07:00:00	900	Przerwa świąteczna	Brak	-	Wszystkie grupy	święto	wolne
36f28da8-5fa4-43d9-881f-4c25b2774dd3	EEs1	2026-04-03	07:00:00	900	Przerwa świąteczna	Brak	-	Wszystkie grupy	święto	wolne
b2c1cc92-23fa-4c28-a623-3dea22bca435	EEs1	2026-04-04	07:00:00	900	Przerwa świąteczna	Brak	-	Wszystkie grupy	święto	wolne
e7cc81bb-eb40-4d87-8a78-992ef0511ce9	EEs1	2026-04-05	07:00:00	900	Przerwa świąteczna	Brak	-	Wszystkie grupy	święto	wolne
399b1899-76aa-48fe-8f4e-458799635f62	EEs1	2026-04-06	07:00:00	900	Przerwa świąteczna	Brak	-	Wszystkie grupy	święto	wolne
debcffa3-eadd-4f3e-b98b-f0ab09bf0f8c	EEs1	2026-04-07	07:00:00	900	Przerwa świąteczna	Brak	-	Wszystkie grupy	święto	wolne
83a20268-4ee0-4893-b931-7171b00f4f75	EEs1	2026-04-08	11:45:00	90	Modelowanie układów elektromagnetycznych	prof. A. Warzecha	9	W	wykład	aktywne
5e8884e9-8242-44a5-9e26-71201e6bf859	EEs1	2026-04-08	13:30:00	90	Zakłócenia w układach elektroenergetycznych	prof. J. Szczepanik	8	L4	laboratoria	aktywne
fb4fecb9-d873-456a-933b-29f9c3df5a50	EEs1	2026-04-08	16:15:00	90	Systemy generacji i przetwarzania energii elektrycznej	prof. A. Warzecha	10	W	wykład	aktywne
abf8ba03-54c7-4820-8c4d-1c6d0147c0a8	EEs1	2026-04-08	18:00:00	90	Modelowanie układów elektromagnetycznych	dr inż. N. Radwan-Pragłowska	13	Lk3E	laboratoria	aktywne
5c51aacf-e37a-465b-9cab-21551a5bd561	EEs1	2026-04-09	08:30:00	90	Komputerowe projektowanie urządzeń dla elektroenergetyki	mgr inż. S. Nachman	13	Lk2E	laboratoria	aktywne
300e3f2c-30e2-42cc-a7fa-b5f39f82fc24	EEs1	2026-04-09	11:00:00	90	Język angielski	mgr J. Firganek	139SJO	Lek1	laboratoria	aktywne
b485c85d-d90b-4c7e-9361-65c2d12ca6e4	EEs1	2026-04-09	16:15:00	90	Modelowanie układów elektromagnetycznych	dr inż. M. Sierżęga	A2	W / C	wykład	aktywne
e030618f-24cf-43c1-9d0a-52617750d960	EEs1	2026-04-10	10:00:00	180	Projektowanie instalacji elektrycznych	dr inż. Ł. Sołtysek_	MsTeams	W / C / K / P	wykład	aktywne
69de328f-a06f-4e53-be48-62b0cdd5bc74	EEs1	2026-04-13	14:30:00	90	Język niemiecki	mgr E. Targosz	139SJO	Lek	laboratoria	aktywne
2021cb7a-def5-4580-953b-d2bc8d8e8d05	EEs1	2026-04-15	11:45:00	90	Zakłócenia w układach elektroenergetycznych	prof. J. Szczepanik	9	W	wykład	aktywne
bff68f10-54d2-485e-81cf-4e23cdec0b7d	EEs1	2026-04-15	13:30:00	135	Zakłócenia w układach elektroenergetycznych	prof. J. Szczepanik	12	Lk2E	laboratoria	aktywne
8e64931b-2c6e-4a00-b7b6-29f5e7018127	EEs1	2026-04-15	16:15:00	90	Systemy generacji i przetwarzania energii elektrycznej	prof. A. Warzecha	10	W	wykład	aktywne
eb5a6b20-cd56-4d06-bc48-413457da829d	EEs1	2026-04-15	18:00:00	90	Modelowanie układów elektromagnetycznych	dr inż. N. Radwan-Pragłowska	13	Lk3E	laboratoria	aktywne
85d0a0c4-25ff-48a6-a0e7-80029ef4eb93	EEs1	2026-04-16	08:30:00	90	Komputerowe projektowanie urządzeń dla elektroenergetyki	mgr inż. S. Nachman	13	Lk2E	laboratoria	aktywne
463de62f-809d-4df5-a395-88d97655b497	EEs1	2026-04-16	11:00:00	90	Język angielski	mgr J. Firganek	139SJO	Lek1	laboratoria	aktywne
30487443-06f4-4df6-8b5f-5303e9c07748	EEs1	2026-04-16	16:15:00	90	Modelowanie układów elektromagnetycznych	dr inż. M. Sierżęga	A2	W / C	wykład	aktywne
440f3423-464a-4376-9140-5f6416b6dfaf	EEs1	2026-04-17	10:00:00	180	Projektowanie instalacji elektrycznych	dr inż. Ł. Sołtysek_	MsTeams	W / C / K / P	wykład	aktywne
1e1a527c-4a8a-4651-9750-6a247416934e	EEs1	2026-04-20	11:00:00	90	Systemy generacji i przetwarzania energii elektrycznej	prof. M. Jaraczewski	13	Lk2E	laboratoria	aktywne
8324076a-860f-411b-94dd-6fac46eb37b2	EEs1	2026-04-20	12:45:00	90	Systemy generacji i przetwarzania energii elektrycznej	prof. M. Jaraczewski	13	P2E	laboratoria	aktywne
3b2b35f7-d874-42e4-9c46-d23ae19582b6	EEs1	2026-04-20	14:30:00	90	Język niemiecki	mgr E. Targosz	139SJO	Lek	laboratoria	aktywne
365a40cb-5c27-43e9-b5c4-c97ea95dd5b6	EEs1	2026-04-22	13:30:00	90	Zakłócenia w układach elektroenergetycznych	prof. J. Szczepanik	8	L3	laboratoria	aktywne
fff05a8e-b7c8-4763-ab70-1efe76bcb0a4	EEs1	2026-04-22	18:00:00	90	Modelowanie układów elektromagnetycznych	dr inż. N. Radwan-Pragłowska	13	Lk3E	laboratoria	aktywne
eebb2b79-df06-4de8-802a-6c1c519e8181	EEs1	2026-04-23	08:30:00	135	Technika wysokich napięć	dr inż. D. Smugała	010A	L4	laboratoria	aktywne
479f616f-1e2b-401e-8b07-2b46e0260e5c	EEs1	2026-04-23	11:00:00	90	Język angielski	mgr J. Firganek	139SJO	Lek1	laboratoria	aktywne
f2c180bf-2548-4def-aa22-dbc45d89061f	EEs1	2026-04-23	12:45:00	90	Technika wysokich napięć	dr inż. D. Smugała	A4	W	wykład	aktywne
9f8d0ccc-cdd6-4eac-aac6-3220eba0c0bc	EEs1	2026-04-23	14:30:00	135	Technika wysokich napięć	dr inż. D. Smugała	010A	L3	laboratoria	aktywne
2693225b-475c-46c5-9a59-88b31a95776c	EEs1	2026-04-23	17:00:00	90	Modelowanie układów elektromagnetycznych	dr inż. M. Sierżęga	A2	W / C	wykład	aktywne
95bb9fc7-b9d3-4df7-8c2d-c8e25ef3c729	EEs1	2026-04-24	10:00:00	180	Projektowanie instalacji elektrycznych	dr inż. Ł. Sołtysek_	MsTeams	W / C / K / P	wykład	aktywne
3006e847-8c61-48e5-9221-4fe8be1fbb42	EEs1	2026-04-27	14:30:00	90	Język niemiecki	mgr E. Targosz	139SJO	Lek	laboratoria	aktywne
e02ccab7-76d2-4c30-a605-d428f1f58a22	EEs1	2026-04-29	11:45:00	90	Zakłócenia w układach elektroenergetycznych	prof. J. Szczepanik	9	W	wykład	aktywne
c29936b3-e60b-4ec8-8b14-49f815ec8ef9	EEs1	2026-04-29	13:30:00	90	Zakłócenia w układach elektroenergetycznych	prof. J. Szczepanik	8	L4	laboratoria	aktywne
1aa2afef-fdc7-44e1-9075-dee91f14063b	EEs1	2026-04-29	18:00:00	90	Modelowanie układów elektromagnetycznych	dr inż. N. Radwan-Pragłowska	13	Lk3E	laboratoria	aktywne
bca884cf-e874-412d-a7a0-7041ba3d8cb1	EEs1	2026-04-30	08:30:00	90	Komputerowe projektowanie urządzeń dla elektroenergetyki	mgr inż. S. Nachman	13	Lk2E	laboratoria	aktywne
38f304f6-6c9f-4435-9ca2-ee04cb6a2736	EEs1	2026-04-30	10:15:00	135	Technika wysokich napięć	dr inż. D. Smugała	010A	L4	laboratoria	aktywne
93970794-a474-46e1-a651-9e2c7f0a6e73	EEs1	2026-04-30	12:45:00	90	Technika wysokich napięć	dr inż. D. Smugała	A4	W	wykład	aktywne
804d63e0-da05-4403-9048-2e0fe551d686	EEs1	2026-04-30	14:30:00	135	Technika wysokich napięć	dr inż. D. Smugała	010A	L3	laboratoria	aktywne
7959ebc8-8caa-4c45-8e20-e32687697554	EEs1	2026-04-30	17:00:00	90	Modelowanie układów elektromagnetycznych	dr inż. M. Sierżęga	A2	W / C	wykład	aktywne
3e55931d-9a86-4812-b87c-c0ef081b6338	EEs1	2026-05-01	07:00:00	900	Majówka	Brak	-	Wszystkie grupy	święto	wolne
227e1993-617f-43c2-b1d5-6edb37490d62	EEs1	2026-05-02	07:00:00	900	Majówka	Brak	-	Wszystkie grupy	święto	wolne
7e05126c-ff89-49b1-aa62-b5147aca230e	EEs1	2026-05-03	07:00:00	900	Majówka	Brak	-	Wszystkie grupy	święto	wolne
e6d17988-4040-483a-817d-12490137bc9f	EEs1	2026-05-04	07:00:00	900	Majówka	Brak	-	Wszystkie grupy	święto	wolne
492c8ca6-3a9e-4ae4-adc7-3ffed8d30d2a	EEs1	2026-05-07	08:30:00	90	Komputerowe projektowanie urządzeń dla elektroenergetyki	mgr inż. S. Nachman	13	Lk2E	laboratoria	aktywne
dfc9f26d-2919-4d41-81e9-bed7ce4b439f	EEs1	2026-05-07	10:15:00	135	Technika wysokich napięć	dr inż. D. Smugała	010A	L4	laboratoria	aktywne
8a535415-67a7-4654-b860-155419cb7016	EEs1	2026-05-07	12:45:00	90	Technika wysokich napięć	dr inż. D. Smugała	A4	W	wykład	aktywne
e959e7e1-b899-4a1f-850b-5346d8803560	EEs1	2026-05-07	14:30:00	135	Technika wysokich napięć	dr inż. D. Smugała	010A	L3	laboratoria	aktywne
cc14db7e-4256-4ea8-84d8-c4d1d986fc14	EEs1	2026-05-07	17:00:00	90	Modelowanie układów elektromagnetycznych	dr inż. M. Sierżęga	A2	W / C	wykład	aktywne
9c706a57-42dd-4a97-a228-7185971db228	EEs1	2026-05-08	10:00:00	180	Projektowanie instalacji elektrycznych	dr inż. Ł. Sołtysek_	MsTeams	W / C / K / P	wykład	aktywne
cb453110-5a1c-4655-ba97-959a550ca548	EEs1	2026-05-12	07:00:00	900	Święto Szkoły	Brak	-	Wszystkie grupy	święto	wolne
8f208062-c80e-4bc3-ad61-86bf9b374d28	EEs1	2026-05-13	11:45:00	90	Zakłócenia w układach elektroenergetycznych	prof. J. Szczepanik	9	W	wykład	aktywne
a420a620-c424-4b24-904f-ae16338bb3c5	EEs1	2026-05-13	13:30:00	90	Zakłócenia w układach elektroenergetycznych	prof. J. Szczepanik	8	L3	laboratoria	aktywne
b93e5aa5-2fb0-4b63-b624-24057617a52b	EEs1	2026-05-14	08:30:00	90	Komputerowe projektowanie urządzeń dla elektroenergetyki	mgr inż. S. Nachman	13	Lk2E	laboratoria	aktywne
3f337db9-29fe-4a0c-acb3-fa65ee092db2	EEs1	2026-05-14	10:15:00	135	Technika wysokich napięć	dr inż. D. Smugała	010A	L4	laboratoria	aktywne
ae846d61-4ec2-4bb7-bc7a-7f7cafa595a7	EEs1	2026-05-14	12:45:00	90	Technika wysokich napięć	dr inż. D. Smugała	A4	W	wykład	aktywne
bb89ab60-0a5d-46ba-8902-6e2f1f20b32a	EEs1	2026-05-14	14:30:00	135	Technika wysokich napięć	dr inż. D. Smugała	010A	L3	laboratoria	aktywne
a8fd25b4-d574-41a0-9f82-c33224d69531	EEs1	2026-05-15	10:00:00	180	Projektowanie instalacji elektrycznych	dr inż. Ł. Sołtysek_	MsTeams	W / C / K / P	wykład	aktywne
e982c0cf-52c6-4374-8e52-4655519de151	EEs1	2026-05-18	11:00:00	90	Systemy generacji i przetwarzania energii elektrycznej	prof. M. Jaraczewski	13	Lk2E	laboratoria	aktywne
839f199e-0f07-49c0-ae62-2bdbd70f59b8	EEs1	2026-05-18	12:45:00	90	Systemy generacji i przetwarzania energii elektrycznej	prof. M. Jaraczewski	13	P2E	laboratoria	aktywne
3ef31770-ebc7-48c4-ad4d-29d021628553	EEs1	2026-05-21	08:30:00	90	Komputerowe projektowanie urządzeń dla elektroenergetyki	mgr inż. S. Nachman	13	Lk2E	laboratoria	aktywne
8280c6bc-4190-4405-8377-58e0b0e8bd40	EEs1	2026-05-21	12:45:00	90	Technika wysokich napięć	dr inż. D. Smugała	A4	W	wykład	aktywne
15af998b-a742-4c6d-8fbf-75315a43b098	EEs1	2026-05-21	14:30:00	135	Technika wysokich napięć	dr inż. D. Smugała	010A	L3	laboratoria	aktywne
ade67e86-da27-47fe-90ae-657639f4a8e1	EEs1	2026-05-22	10:00:00	180	Projektowanie instalacji elektrycznych	dr inż. Ł. Sołtysek_	MsTeams	W / C / K / P	wykład	aktywne
681a16fa-f1b7-4c90-9053-9d0d4f028032	EEs1	2026-05-24	07:00:00	900	Zielone Świątki	Brak	-	Wszystkie grupy	święto	wolne
7cd108c1-8535-4267-9443-05c0cf6772c8	EEs1	2026-05-28	08:30:00	90	Komputerowe projektowanie urządzeń dla elektroenergetyki	mgr inż. S. Nachman	13	Lk2E	laboratoria	aktywne
e61d92b9-1890-4d93-824f-db85a30e6dfb	EEs1	2026-05-29	10:00:00	180	Projektowanie instalacji elektrycznych	dr inż. Ł. Sołtysek_	MsTeams	W / C / K / P	wykład	aktywne
4322de4a-6598-44b4-9890-af356ed233f7	EEs1	2026-06-01	11:00:00	90	Systemy generacji i przetwarzania energii elektrycznej	prof. M. Jaraczewski	13	Lk2E	laboratoria	aktywne
4cad15ab-3f13-42b4-9624-8539a5273365	EEs1	2026-06-01	12:45:00	90	Systemy generacji i przetwarzania energii elektrycznej	prof. M. Jaraczewski	13	P2E	laboratoria	aktywne
d5b615dc-32eb-4d0e-9343-5f9f2273a6f6	EEs1	2026-06-04	07:00:00	900	Boże Ciało	Brak	-	Wszystkie grupy	święto	wolne
d44bf0f0-0146-467b-807e-4e1a613d8fef	EEs1	2026-06-05	07:00:00	900	Boże Ciało	Brak	-	Wszystkie grupy	święto	wolne
974765c9-7d7c-41c2-bf4f-650a7b720a55	EEs1	2026-06-11	08:30:00	90	Komputerowe projektowanie urządzeń dla elektroenergetyki	mgr inż. S. Nachman	13	Lk2E	laboratoria	aktywne
5d6c3aa1-923d-4d15-8216-2d8fe9a8dfdd	EEs1	2026-06-15	11:00:00	90	Systemy generacji i przetwarzania energii elektrycznej	prof. M. Jaraczewski	13	Lk2E	laboratoria	aktywne
e95dfc93-ead2-4828-82f1-d629faf9fcdc	EEs1	2026-06-15	12:45:00	90	Systemy generacji i przetwarzania energii elektrycznej	prof. M. Jaraczewski	13	P2E	laboratoria	aktywne
a93a4bdc-20d2-4da5-8a16-07d1a885fee8	EEs3	2026-02-23	12:45:00	90	Problemy jakości energii elektrycznej	prof. A. Szromba	12	Lk	laboratoria	aktywne
364b55bc-cdb4-4fc2-a6e2-705c7ec77b0c	EEs3	2026-02-24	09:15:00	90	Systemy monitoringu i sterowania w budownictwie	mgr inż. K. Hatłas	WA201	Lk	laboratoria	aktywne
cbc8a071-fe89-48e6-a68d-f9cf184a40f8	EEs3	2026-02-24	11:00:00	90	Systemy monitoringu i sterowania w budownictwie	mgr inż. K. Hatłas	WA201	L	laboratoria	aktywne
82aa8bc7-9c6f-4026-af2e-1d1fa673b7f9	EEs3	2026-02-24	12:45:00	90	Problemy jakości energii elektrycznej	prof. A. Szromba	9	W	wykład	aktywne
4700cc0c-4316-4b8a-bda9-36a15faef78e	EEs3	2026-02-24	14:30:00	90	Programy wsparcia innowacyjności przedsiębiorstw	dr inż. J. Bąk	108D	S1	laboratoria	aktywne
b8640436-22f9-48c3-aaca-35063ddcfa08	EEs3	2026-02-25	09:15:00	90	Prawo energetyczne i rynki energii	dr inż. A. Korzeń	A2	W	wykład	aktywne
64cdc23f-f991-45db-8a9b-81e839a19223	EEs3	2026-02-26	14:30:00	90	Systemy monitoringu i sterowania w budownictwie	dr inż. A. Romańska	10	W	wykład	aktywne
cecbc9fe-1790-402a-ab21-4b73bce15617	EEs3	2026-02-26	16:15:00	90	Seminarium dyplomowe	prof. K. Kluszczyński	A1	S1	laboratoria	aktywne
60bc5d77-1bd0-4da6-8fe0-0e1ff9c0817e	EEs3	2026-03-02	12:45:00	90	Problemy jakości energii elektrycznej	prof. A. Szromba	12	Lk	laboratoria	aktywne
63d7d994-1636-406e-87d8-2697d35592a5	EEs3	2026-03-03	09:15:00	90	Systemy monitoringu i sterowania w budownictwie	mgr inż. K. Hatłas	WA201	Lk	laboratoria	aktywne
6239badf-1549-40dc-a40f-3da21944869b	EEs3	2026-03-03	11:00:00	90	Systemy monitoringu i sterowania w budownictwie	mgr inż. K. Hatłas	WA201	L	laboratoria	aktywne
a22e1ccf-7857-4c4e-8578-84184ab0f368	EEs3	2026-03-03	12:45:00	90	Problemy jakości energii elektrycznej	prof. A. Szromba	9	W	wykład	aktywne
74e0efea-8b92-4099-ae81-08bd2cb03427	EEs3	2026-03-03	14:30:00	135	Programy wsparcia innowacyjności przedsiębiorstw	dr inż. J. Bąk	108D	S1	laboratoria	aktywne
9eeb9776-656b-4712-bafa-9e5c26a43d6d	EEs3	2026-03-04	09:15:00	90	Prawo energetyczne i rynki energii	dr inż. A. Korzeń	A2	W	wykład	aktywne
35a8d4cc-c666-4a34-96dc-389e001989e6	EEs3	2026-03-05	14:30:00	90	Systemy monitoringu i sterowania w budownictwie	dr inż. A. Romańska	10	W	wykład	aktywne
f3dd17d2-1de8-4579-b613-05d614512f94	EEs3	2026-03-05	16:15:00	90	Seminarium dyplomowe	prof. K. Kluszczyński	A1	S1	laboratoria	aktywne
90ba7fcd-1fa4-4442-864c-d9106aa95339	EEs3	2026-03-09	12:45:00	90	Problemy jakości energii elektrycznej	prof. A. Szromba	12	Lk	laboratoria	aktywne
fe0b4bbd-f4fe-49ab-ad56-fc8e9a60ceee	EEs3	2026-03-10	09:15:00	90	Systemy monitoringu i sterowania w budownictwie	mgr inż. K. Hatłas	WA201	Lk	laboratoria	aktywne
359ab400-c234-47d3-9a62-ca26e1dcef1b	EEs3	2026-03-10	11:00:00	90	Systemy monitoringu i sterowania w budownictwie	mgr inż. K. Hatłas	WA201	L	laboratoria	aktywne
9ac23408-576c-4f03-b9a4-fa6a91278800	EEs3	2026-03-10	12:45:00	90	Problemy jakości energii elektrycznej	prof. A. Szromba	9	W	wykład	aktywne
2ce0c72b-2629-4f52-a5fc-94b76a9754d2	EEs3	2026-03-10	14:30:00	90	Programy wsparcia innowacyjności przedsiębiorstw	dr inż. J. Bąk	108D	S1	laboratoria	aktywne
90e0502d-ae35-4b4e-aa00-2c44d1bf6502	EEs3	2026-03-11	09:15:00	90	Prawo energetyczne i rynki energii	dr inż. A. Korzeń	A2	W	wykład	aktywne
0eeb3a90-2a15-419a-bff4-24808bb1103d	EEs3	2026-03-12	14:30:00	90	Systemy monitoringu i sterowania w budownictwie	dr inż. A. Romańska	10	W	wykład	aktywne
ee35b740-7e45-415f-92ff-7d1739bf8fb9	EEs3	2026-03-12	16:15:00	90	Seminarium dyplomowe	prof. K. Kluszczyński	A1	S1	laboratoria	aktywne
6790160d-615b-46d6-80ef-6619d1021eca	EEs3	2026-03-16	12:45:00	90	Problemy jakości energii elektrycznej	prof. A. Szromba	12	Lk	laboratoria	aktywne
59544337-d93b-4614-9d19-67c4b3d58f70	EEs3	2026-03-17	09:15:00	90	Systemy monitoringu i sterowania w budownictwie	mgr inż. K. Hatłas	WA201	Lk	laboratoria	aktywne
7bbbc3e9-3731-4046-a0c9-f479bbba005a	EEs3	2026-03-17	11:00:00	90	Systemy monitoringu i sterowania w budownictwie	mgr inż. K. Hatłas	WA201	L	laboratoria	aktywne
fe4e023c-8f02-4c53-ac92-93c54e636936	EEs3	2026-03-17	12:45:00	90	Problemy jakości energii elektrycznej	prof. A. Szromba	9	W	wykład	aktywne
49eaab9a-0bf4-4b58-9759-81c55061f032	EEs3	2026-03-17	14:30:00	90	Programy wsparcia innowacyjności przedsiębiorstw	dr inż. J. Bąk	108D	S1	laboratoria	aktywne
1d8d0f65-325d-43b8-9100-0e47359a648a	EEs3	2026-03-18	09:15:00	90	Prawo energetyczne i rynki energii	dr inż. A. Korzeń	A2	W	wykład	aktywne
b132a020-b9c7-437e-ab73-375005261dac	EEs3	2026-03-19	14:30:00	90	Systemy monitoringu i sterowania w budownictwie	dr inż. A. Romańska	10	W	wykład	aktywne
9e6b78bd-58ca-47b7-a0e0-9c18244c62cd	EEs3	2026-03-23	12:45:00	90	Problemy jakości energii elektrycznej	prof. A. Szromba	12	Lk	laboratoria	aktywne
e10d4950-2a28-499a-ba09-1ab9da8e997b	EEs3	2026-03-24	09:15:00	90	Systemy monitoringu i sterowania w budownictwie	mgr inż. K. Hatłas	WA201	Lk	laboratoria	aktywne
da938d75-f6a6-4a1a-b0dd-f1ae20d7a13f	EEs3	2026-03-24	11:00:00	90	Systemy monitoringu i sterowania w budownictwie	mgr inż. K. Hatłas	WA201	L	laboratoria	aktywne
7d63bcff-edb1-4540-a169-9393ee64a14b	EEs3	2026-03-24	12:45:00	90	Problemy jakości energii elektrycznej	prof. A. Szromba	9	W	wykład	aktywne
bdfe5e86-948f-431e-a036-c39d09cea848	EEs3	2026-03-24	14:30:00	90	Programy wsparcia innowacyjności przedsiębiorstw	dr inż. J. Bąk	108D	S1	laboratoria	aktywne
8f03191f-738b-4778-9f38-b253c8dbb415	EEs3	2026-03-25	09:15:00	90	Prawo energetyczne i rynki energii	dr inż. A. Korzeń	A2	W	wykład	aktywne
29ebbc22-04cc-4aec-b875-9c74d370cdb0	EEs3	2026-03-26	14:30:00	90	Systemy monitoringu i sterowania w budownictwie	dr inż. A. Romańska	10	W	wykład	aktywne
164a64ea-cb32-471f-84f6-209f3f545f87	EEs3	2026-03-26	16:15:00	90	Seminarium dyplomowe	prof. K. Kluszczyński	A1	S1	laboratoria	aktywne
d0eb671d-2f6b-4e00-8026-4d70681f4171	EEs3	2026-03-30	12:45:00	90	Problemy jakości energii elektrycznej	prof. A. Szromba	12	Lk	laboratoria	aktywne
b5b53425-2185-454c-a2d2-6f9725d0d61d	EEs3	2026-03-31	09:15:00	90	Systemy monitoringu i sterowania w budownictwie	mgr inż. K. Hatłas	WA201	Lk	laboratoria	aktywne
f31b2499-df24-4bae-a95b-ad8ef535d4fa	EEs3	2026-03-31	11:00:00	90	Systemy monitoringu i sterowania w budownictwie	mgr inż. K. Hatłas	WA201	L	laboratoria	aktywne
377f46cc-b074-4faa-a312-6038813fc3bd	EEs3	2026-03-31	12:45:00	90	Problemy jakości energii elektrycznej	prof. A. Szromba	9	W	wykład	aktywne
b197fa11-ae1f-451b-8df2-19b1aae02a3a	EEs3	2026-03-31	14:30:00	90	Programy wsparcia innowacyjności przedsiębiorstw	dr inż. J. Bąk	108D	S1	laboratoria	aktywne
96396f46-f21d-43a8-a37c-4d40d31b4d91	EEs3	2026-04-01	07:00:00	900	Przerwa świąteczna	Brak	-	Wszystkie grupy	święto	wolne
060eade5-841f-4ef3-a4fa-c19f1825947d	EEs3	2026-04-02	07:00:00	900	Przerwa świąteczna	Brak	-	Wszystkie grupy	święto	wolne
faded372-336a-4d5c-8d0a-4b18fc3636f4	EEs3	2026-04-03	07:00:00	900	Przerwa świąteczna	Brak	-	Wszystkie grupy	święto	wolne
aadfaba3-1d55-4480-a6f8-11f4c33a655b	EEs3	2026-04-04	07:00:00	900	Przerwa świąteczna	Brak	-	Wszystkie grupy	święto	wolne
c03cdb41-fd6d-4861-af7d-1e9e2821ae37	EEs3	2026-04-05	07:00:00	900	Przerwa świąteczna	Brak	-	Wszystkie grupy	święto	wolne
62d8ac51-13a2-4af1-8856-7da91579a9b2	EEs3	2026-04-06	07:00:00	900	Przerwa świąteczna	Brak	-	Wszystkie grupy	święto	wolne
7445b4f2-9b0b-4e87-b881-b50f8723d0f4	EEs3	2026-04-07	07:00:00	900	Przerwa świąteczna	Brak	-	Wszystkie grupy	święto	wolne
9dfa8577-a30a-4122-96b6-6502f08916fb	EEs3	2026-04-09	14:30:00	90	Systemy monitoringu i sterowania w budownictwie	dr inż. A. Romańska	10	W	wykład	aktywne
33819790-cfbf-42cb-bb7b-8795c5c2f6c9	EEs3	2026-04-09	16:15:00	90	Seminarium dyplomowe	prof. K. Kluszczyński	A1	S1	laboratoria	aktywne
09932e68-9435-41f6-b902-3e2aa08740d5	EEs3	2026-04-13	12:45:00	90	Problemy jakości energii elektrycznej	prof. A. Szromba	12	Lk	laboratoria	aktywne
59827a0f-a489-475e-8d16-a062e770d886	EEs3	2026-04-14	09:15:00	90	Systemy monitoringu i sterowania w budownictwie	mgr inż. K. Hatłas	WA201	Lk	laboratoria	aktywne
4efbe1fc-ca28-4a2c-a9fa-f54571854eb1	EEs3	2026-04-14	11:00:00	90	Systemy monitoringu i sterowania w budownictwie	mgr inż. K. Hatłas	WA201	L	laboratoria	aktywne
8d91a74b-b778-461a-a314-c6e22ddfe834	EEs3	2026-04-14	12:45:00	90	Problemy jakości energii elektrycznej	prof. A. Szromba	9	W	wykład	aktywne
a8cdeff3-8ce9-4649-94ec-d1586465629b	EEs3	2026-04-14	14:30:00	90	Programy wsparcia innowacyjności przedsiębiorstw	dr inż. J. Bąk	108D	S1	laboratoria	aktywne
224864cf-e20a-4e8c-902a-6fe8d8e1d849	EEs3	2026-04-16	14:30:00	90	Systemy monitoringu i sterowania w budownictwie	dr inż. A. Romańska	10	W	wykład	aktywne
2effa224-0a0a-4ca2-8435-624763fb0380	EEs3	2026-04-20	12:45:00	90	Problemy jakości energii elektrycznej	prof. A. Szromba	12	Lk	laboratoria	aktywne
b17cb668-8696-4e8a-932c-8011edfbc896	EEs3	2026-04-21	09:15:00	90	Systemy monitoringu i sterowania w budownictwie	mgr inż. K. Hatłas	WA201	Lk	laboratoria	aktywne
13a00af0-ebfe-4440-9b5d-adcfe77ac2e2	EEs3	2026-04-21	11:00:00	90	Systemy monitoringu i sterowania w budownictwie	mgr inż. K. Hatłas	WA201	L	laboratoria	aktywne
dfeaf04d-674d-45fa-a127-5a9ed870dba2	EEs3	2026-04-21	12:45:00	90	Problemy jakości energii elektrycznej	prof. A. Szromba	9	W	wykład	aktywne
e7722015-282a-424e-8e65-8e4de6a1cc82	EEs3	2026-04-23	14:30:00	90	Systemy monitoringu i sterowania w budownictwie	dr inż. A. Romańska	10	W	wykład	aktywne
94fca562-096d-431a-8903-fd8484bf8202	EEs3	2026-05-01	07:00:00	900	Majówka	Brak	-	Wszystkie grupy	święto	wolne
72de6c6c-7e71-4ed1-8722-f783c1c1666f	EEs3	2026-05-02	07:00:00	900	Majówka	Brak	-	Wszystkie grupy	święto	wolne
1b334507-e96a-4e5b-9cea-012ed5bb7061	EEs3	2026-05-03	07:00:00	900	Majówka	Brak	-	Wszystkie grupy	święto	wolne
f0bdd517-804f-4c49-b01e-5d35e9f4583f	EEs3	2026-05-04	07:00:00	900	Majówka	Brak	-	Wszystkie grupy	święto	wolne
b9a92dc1-8044-4a30-a0e5-afbab8035094	EEs3	2026-05-12	07:00:00	900	Święto Szkoły	Brak	-	Wszystkie grupy	święto	wolne
49554526-b9a5-42a0-a209-bc07f0bbb627	EEs3	2026-05-24	07:00:00	900	Zielone Świątki	Brak	-	Wszystkie grupy	święto	wolne
8c602555-877e-47ef-a48d-8b05939dac17	EEs3	2026-06-04	07:00:00	900	Boże Ciało	Brak	-	Wszystkie grupy	święto	wolne
8e91c927-2283-44df-b082-1cd2ed54bdea	EEs3	2026-06-05	07:00:00	900	Boże Ciało	Brak	-	Wszystkie grupy	święto	wolne
3e963218-7945-4334-8f3e-4bf80854b95f	EiAs2	2026-02-23	07:30:00	135	Analiza matematyczna	dr A. Pudełko	A2	W	Wykład	aktywne
4692cf3b-a120-4a11-8922-6cd63485e4e9	EiAs2	2026-02-23	10:00:00	90	Analiza matematyczna	dr A. Pudełko	A2	Ć2	Ćwiczenia	aktywne
5b7795d5-f311-47a3-af95-16af786f4dc4	EiAs2	2026-02-23	10:00:00	90	Język angielski	mgr J. Firganek	136SJO	Lek5	Lektorat	aktywne
2d41acf8-aa10-4a65-9ae4-63f865e0fc17	EiAs2	2026-02-23	10:00:00	90	Język angielski	mgr A. Zwierzyńska-Dubis	139SJO	Lek1	Lektorat	aktywne
a707d9f5-2ce8-466d-a4b8-10d3cae83fc3	EiAs2	2026-02-23	11:45:00	90	Analiza matematyczna	mgr M. Ból	A2	Ć1	Ćwiczenia	aktywne
7175acc6-004b-41e2-81a7-7941c3cbfc00	EiAs2	2026-02-23	11:45:00	90	Język angielski	mgr J. Firganek	136SJO	Lek3	Lektorat	aktywne
da6661f4-1008-4f78-804e-01b27ebf5183	EiAs2	2026-02-23	11:45:00	90	Język niemiecki	mgr E. Targosz	139SJO	Lek	Lektorat	aktywne
747637d2-835b-4a65-9950-00e255a2e91b	EiAs2	2026-02-23	13:30:00	90	Analiza matematyczna	dr J. Czajkowski	A2	Ć3	Ćwiczenia	aktywne
9860f490-04b9-453c-97dd-97c7f1ca8583	EiAs2	2026-02-23	13:30:00	90	Język angielski	mgr J. Firganek	136SJO	Lek2	Lektorat	aktywne
7c0aa8b6-760a-43ca-80c7-4b3ec14d3e09	EiAs2	2026-02-23	13:30:00	90	Programowanie w C++	mgr inż. M. Raźny	19	P1	Projekt	aktywne
e6a22dd8-038b-4507-8080-5909fd0b1f0c	EiAs2	2026-02-23	15:15:00	90	Programowanie w C++	mgr inż. M. Raźny	19	P5	Projekt	aktywne
885a69d5-0ac2-4265-84e3-9483b5004290	EiAs2	2026-02-23	17:00:00	90	Programowanie w C++	mgr inż. M. Raźny	19	P3	Projekt	aktywne
2cdd16bb-6ef8-4d16-942b-9e01f55ec793	EiAs2	2026-02-23	17:00:00	90	Geometria i grafika inżynierska w AUTOCAD	prof. P. Małka	18	P5	Projekt	aktywne
5d1b477f-e924-4b0d-a2eb-438aeb086001	EiAs2	2026-02-24	07:30:00	90	Geometria i grafika inżynierska w AUTOCAD	prof. P. Małka	12	P2	Projekt	aktywne
af7bf132-3ee0-4885-b987-a49b4057bd83	EiAs2	2026-02-24	09:15:00	90	Podstawy elektroniki	prof. A. Szromba	A4	W	Wykład	aktywne
1da1f4f7-77e8-4957-8563-d348ae5d15bb	EiAs2	2026-02-24	11:00:00	90	Język angielski	mgr A. Zwierzyńska-Dubis	150SJO	Lek4	Lektorat	aktywne
9860ea6a-a3c7-4f33-b64d-7e4ab902133b	EiAs2	2026-02-24	11:00:00	90	Podstawy elektroniki	prof. A. Szromba	A4	Ć2	Ćwiczenia	aktywne
c4220391-0633-4a09-85b5-3dfb850180fd	EiAs2	2026-02-24	12:45:00	90	Metody numeryczne	dr inż. G. Pędrak	A3	W	Wykład	aktywne
037253c8-502f-406c-a602-984cdfb591cb	EiAs2	2026-02-24	14:30:00	90	Geometria i grafika inżynierska w AUTOCAD	dr inż. Z. Pilch	A4	W	Wykład	aktywne
d457ddd5-1be0-499a-b616-9016cf052f4b	EiAs2	2026-02-24	16:15:00	90	Geometria i grafika inżynierska w AUTOCAD	prof. P. Małka	13	Lk6	Lab. Komp.	aktywne
2431a935-aa4b-451c-87ea-e17ee4a14e43	EiAs2	2026-02-24	18:00:00	90	Programowanie w C++	dr inż. D. Gutenko	19	Lk6	Lab. Komp.	aktywne
d89aa702-12f3-4d91-9aec-794e42fadaef	EiAs2	2026-02-24	19:45:00	90	Geometria i grafika inżynierska w AUTOCAD	prof. P. Małka	13	P6	Projekt	aktywne
78ae055a-c531-465f-8fcd-d1b21d837f20	EiAs2	2026-02-25	11:45:00	90	Podstawy elektroniki	mgr inż. M. Raźny	06	L5	Laboratoria	aktywne
d1980d5f-b48e-4cf5-ba49-399390f73743	EiAs2	2026-02-25	11:45:00	90	Podstawy elektroniki	prof. A. Szromba	10	Ć3	Ćwiczenia	aktywne
a5ac9d4e-ffe4-4879-b66c-47096f7a748c	EiAs2	2026-02-25	11:45:00	90	Metody numeryczne	dr inż. G. Pędrak	202	Lk1	Lab. Komp.	aktywne
6d175faa-afb9-4c38-8459-08b741a3bc49	EiAs2	2026-02-25	13:30:00	90	Podstawy elektroniki	mgr inż. M. Raźny	06	L6	Laboratoria	aktywne
414e7268-e342-46b5-8e87-9ebeb0e96553	EiAs2	2026-02-25	13:30:00	90	Metody numeryczne	dr inż. M. Orkisz	202	Lk3	Lab. Komp.	aktywne
0b0d01df-6fe6-412a-a470-11dd8eb9a202	EiAs2	2026-02-25	13:30:00	90	Programowanie w C++	dr inż. D. Gutenko	19	Lk1	Lab. Komp.	aktywne
74786a59-36af-4ef7-8055-cd6dcb23ddaf	EiAs2	2026-02-25	15:15:00	90	Podstawy elektroniki	mgr inż. M. Raźny	06	L7	Laboratoria	aktywne
6d3f7baa-4dfe-452b-9b1a-19983abd76b2	EiAs2	2026-02-25	15:15:00	90	Metody numeryczne	dr inż. M. Orkisz	202	Lk4	Lab. Komp.	aktywne
cd99611b-71fd-4d42-a68d-89f9d60695c9	EiAs2	2026-02-25	15:15:00	90	Programowanie w C++	dr inż. D. Gutenko	19	Lk2	Lab. Komp.	aktywne
880d036c-3049-4577-94ff-9de24682056e	EiAs2	2026-02-25	16:15:00	90	Język francuski	mgr B. Heil	139SJO	Lek	Lektorat	aktywne
fc9396ab-b54a-4a80-b6ff-078348351ca9	EiAs2	2026-02-25	17:00:00	90	Podstawy elektroniki	mgr inż. M. Raźny	06	L8	Laboratoria	aktywne
5717849e-1d8b-4853-8d1f-2516e3965d71	EiAs2	2026-02-25	17:00:00	90	Programowanie w C++	dr inż. D. Gutenko	19	Lk3	Lab. Komp.	aktywne
35a08f67-8cac-498c-a77b-aaeeca8b313c	EiAs2	2026-02-26	08:15:00	90	Programowanie w C++	dr inż. K. Suchenia	A3	W	Wykład	aktywne
bee64e15-2d44-486b-a94a-13756e6db345	EiAs2	2026-02-26	10:00:00	90	Geometria i grafika inżynierska w AUTOCAD	mgr inż. M. Gibas	13	Lk1	Lab. Komp.	aktywne
449a079b-84f7-4923-b78d-dcd31c37ac6a	EiAs2	2026-02-26	11:45:00	90	Podstawy elektroniki	dr inż. A. Drwal	06	L9	Laboratoria	aktywne
3de96862-69f4-4bfa-a7d1-5ad92686c860	EiAs2	2026-02-26	11:45:00	90	Geometria i grafika inżynierska w AUTOCAD	mgr inż. M. Gibas	13	Lk2	Lab. Komp.	aktywne
7a1cd703-f985-4bfe-be36-83c3f74ff5d6	EiAs2	2026-02-26	13:30:00	90	Podstawy elektroniki	dr inż. S. Żaba	06	L1	Laboratoria	aktywne
af97c5d2-1ea8-48da-b4a9-bb0771a9914b	EiAs2	2026-02-26	13:30:00	90	Geometria i grafika inżynierska w AUTOCAD	mgr inż. M. Gibas	13	Lk3	Lab. Komp.	aktywne
8bc45fed-3271-4565-aeda-2b2bc1678940	EiAs2	2026-02-26	15:15:00	90	Podstawy elektroniki	dr inż. S. Żaba	06	L2	Laboratoria	aktywne
e64c138f-0080-45b8-b922-dffa5c9fea02	EiAs2	2026-02-26	15:15:00	90	Geometria i grafika inżynierska w AUTOCAD	mgr inż. M. Gibas	13	Lk4	Lab. Komp.	aktywne
563a0578-6921-4d5f-9bdf-d907b9963516	EiAs2	2026-02-26	17:00:00	90	Podstawy elektroniki	dr inż. S. Żaba	06	L4	Laboratoria	aktywne
6d97132f-1ffd-453b-8edd-3d02c8c1c946	EiAs2	2026-02-26	17:00:00	90	Geometria i grafika inżynierska w AUTOCAD	mgr inż. M. Gibas	13	Lk5	Lab. Komp.	aktywne
724e621e-4023-4c23-b8a8-e18f59a6fed5	EiAs2	2026-02-26	17:00:00	90	Programowanie w C++	mgr inż. K. Kopera	101B	Lk4	Lab. Komp.	aktywne
e7b411b8-2327-4f62-bbc4-2e37e6c50cc9	EiAs2	2026-02-26	18:45:00	90	Podstawy elektroniki	dr inż. S. Żaba	06	L3	Laboratoria	aktywne
724fc48c-3bbe-4b28-b924-07f055dac16e	EiAs2	2026-02-26	18:45:00	90	Geometria i grafika inżynierska w AUTOCAD	mgr inż. M. Gibas	13	P3	Projekt	aktywne
815995ae-9fa5-4304-9f5b-774013c00871	EiAs2	2026-02-26	18:45:00	90	Programowanie w C++	mgr inż. K. Kopera	101B	Lk5	Lab. Komp.	aktywne
a0f33752-9182-43cd-b01f-de282de20d4e	EiAs2	2026-02-27	08:15:00	135	Fizyka	K. Suchanek (op), J. Kurzyk, W. Chajec	F115	L4 / L5 / L6	Laboratoria	aktywne
9d7a9264-cd73-47d0-979e-a69bd8d0a949	EiAs2	2026-02-27	11:00:00	90	Fizyka	W. Chajec	F101	W	Wykład	aktywne
76f8059f-eccd-4037-9d51-b44aaecceba6	EiAs2	2026-02-27	12:45:00	45	Fizyka	W. Chajec	F203	Ć1	Ćwiczenia	aktywne
435aab22-b06b-4014-aba1-1881f1138853	EiAs2	2026-02-27	12:45:00	45	Fizyka	E. Borsuk	F204	Ć3	Ćwiczenia	aktywne
3b7a726b-a763-4794-bad6-62b5f1ab6f36	EiAs2	2026-02-27	12:45:00	45	Fizyka	B. Burtan-Gwizdała,	F112	Ć2	Ćwiczenia	aktywne
3cccae3b-8333-481d-a531-3b03b65ca4d2	EiAs2	2026-02-27	13:45:00	135	Fizyka	B. Burtan-Gwizdała (op), M. Duras, E. Borsuk	F115	L7 / L8 / L9	Laboratoria	aktywne
723154ab-3b12-45d4-a0e1-354cdfe9101a	EiAs2	2026-03-02	07:30:00	135	Analiza matematyczna	dr A. Pudełko	A2	W	Wykład	aktywne
c6e823c9-da48-4f7e-b385-6fa764d3db77	EiAs2	2026-03-02	10:00:00	90	Analiza matematyczna	dr A. Pudełko	A2	Ć2	Ćwiczenia	aktywne
12b88a6f-3f7f-4621-9ee2-61a3ed4181d8	EiAs2	2026-03-02	10:00:00	90	Język angielski	mgr J. Firganek	136SJO	Lek5	Lektorat	aktywne
9cd03c2d-8f11-44eb-b13a-2103944c13c6	EiAs2	2026-03-02	10:00:00	90	Język angielski	mgr A. Zwierzyńska-Dubis	139SJO	Lek1	Lektorat	aktywne
d17a310a-68f2-46ec-a389-6aa4ca03d39f	EiAs2	2026-03-02	11:45:00	90	Analiza matematyczna	mgr M. Ból	A2	Ć1	Ćwiczenia	aktywne
1d36709a-88e9-4144-8a56-461e0e8865b4	EiAs2	2026-03-02	11:45:00	90	Język angielski	mgr J. Firganek	136SJO	Lek3	Lektorat	aktywne
f619ca23-4a19-4c43-9f26-754033724963	EiAs2	2026-03-02	11:45:00	90	Język niemiecki	mgr E. Targosz	139SJO	Lek	Lektorat	aktywne
b712b144-3882-4db8-b88d-0dabaa904544	EiAs2	2026-03-02	13:30:00	90	Analiza matematyczna	dr J. Czajkowski	A2	Ć3	Ćwiczenia	aktywne
9f04252d-80dc-4843-a117-06d08811f7b8	EiAs2	2026-03-02	13:30:00	90	Język angielski	mgr J. Firganek	136SJO	Lek2	Lektorat	aktywne
c435c026-fe95-4581-b7e4-5de5268074b4	EiAs2	2026-03-02	13:30:00	90	Programowanie w C++	mgr inż. M. Raźny	19	P4	Projekt	aktywne
97b7171f-5626-45be-9a57-0b5211837a98	EiAs2	2026-03-02	15:15:00	90	Programowanie w C++	mgr inż. M. Raźny	19	P2	Projekt	aktywne
8003864b-ce7e-48f2-81d2-eb5df78daa88	EiAs2	2026-03-02	17:00:00	90	Geometria i grafika inżynierska w AUTOCAD	prof. P. Małka	18	P1	Projekt	aktywne
45643825-c592-40f5-bf2a-d5d2a76bd6b0	EiAs2	2026-03-03	09:15:00	90	Podstawy elektroniki	prof. A. Szromba	A4	W	Wykład	aktywne
ff5c91d5-c1b6-43e7-8968-700d380f09e5	EiAs2	2026-03-03	11:00:00	90	Język angielski	mgr A. Zwierzyńska-Dubis	150SJO	Lek4	Lektorat	aktywne
0f35f5b3-43f4-4fd3-9ca2-ff66005c5b3f	EiAs2	2026-03-03	11:00:00	90	Podstawy elektroniki	prof. A. Szromba	A4	Ć1	Ćwiczenia	aktywne
fe808727-5744-4e93-b545-06ada23825f4	EiAs2	2026-03-03	12:45:00	90	Programowanie w C++	dr inż. D. Gutenko	101B	P6	Projekt	aktywne
deeca920-55c3-43f2-bca6-478be0c9d138	EiAs2	2026-03-03	16:15:00	90	Geometria i grafika inżynierska w AUTOCAD	prof. P. Małka	13	Lk6	Lab. Komp.	aktywne
9a489915-55a9-4fe5-b1f1-298c182a3445	EiAs2	2026-03-03	18:00:00	90	Programowanie w C++	dr inż. D. Gutenko	19	Lk6	Lab. Komp.	aktywne
34a95f95-5fcc-4709-968a-e61e9893a4b6	EiAs2	2026-03-04	11:45:00	90	Podstawy elektroniki	mgr inż. M. Raźny	06	L5	Laboratoria	aktywne
79bc1b9a-8abb-42a0-96ab-f0135ac480f0	EiAs2	2026-03-04	11:45:00	90	Metody numeryczne	dr inż. G. Pędrak	202	Lk2	Lab. Komp.	aktywne
602f1d2e-e2c4-4d9b-93ed-86dc5ffd9424	EiAs2	2026-03-04	13:30:00	90	Podstawy elektroniki	mgr inż. M. Raźny	06	L6	Laboratoria	aktywne
be7b80eb-b54e-44fd-b6fb-f900c93df729	EiAs2	2026-03-04	13:30:00	90	Metody numeryczne	dr inż. M. Orkisz	202	Lk5	Lab. Komp.	aktywne
909999bc-498d-4f95-a6a9-2858085bc155	EiAs2	2026-03-04	13:30:00	90	Programowanie w C++	dr inż. D. Gutenko	19	Lk1	Lab. Komp.	aktywne
e63eec32-b907-421b-a727-0be236fdfd7a	EiAs2	2026-03-04	15:15:00	90	Podstawy elektroniki	mgr inż. M. Raźny	06	L7	Laboratoria	aktywne
f2f60581-69ec-46cf-9a41-4e0fbe28bea3	EiAs2	2026-03-04	15:15:00	90	Metody numeryczne	dr inż. M. Orkisz	202	Lk6	Lab. Komp.	aktywne
8fd30346-d493-44d1-b549-61190722bde9	EiAs2	2026-03-04	15:15:00	90	Programowanie w C++	dr inż. D. Gutenko	19	Lk2	Lab. Komp.	aktywne
c295c492-5b0d-421c-bc75-b65e9b8c6560	EiAs2	2026-03-04	16:15:00	90	Język francuski	mgr B. Heil	139SJO	Lek	Lektorat	aktywne
525811da-ce15-4ef4-9ce2-ba2e1aa6a22d	EiAs2	2026-03-04	17:00:00	90	Podstawy elektroniki	mgr inż. M. Raźny	06	L8	Laboratoria	aktywne
5cdd9af2-8c25-45e2-b149-34379210d232	EiAs2	2026-03-04	17:00:00	90	Programowanie w C++	dr inż. D. Gutenko	19	Lk3	Lab. Komp.	aktywne
56f500eb-cf4f-443f-9388-c8c8af23464b	EiAs2	2026-03-05	08:15:00	90	Programowanie w C++	dr inż. K. Suchenia	A3	W	Wykład	aktywne
0b4c59d9-ca79-44ce-b8a7-23c76f65faf6	EiAs2	2026-03-05	10:00:00	90	Geometria i grafika inżynierska w AUTOCAD	mgr inż. M. Gibas	13	Lk1	Lab. Komp.	aktywne
0612ff62-a07a-4dce-a4c3-a1543ad3d3b5	EiAs2	2026-03-05	11:45:00	90	Podstawy elektroniki	dr inż. A. Drwal	06	L9	Laboratoria	aktywne
3c5c4cdd-0604-4075-b479-9202322ab930	EiAs2	2026-03-05	11:45:00	90	Geometria i grafika inżynierska w AUTOCAD	mgr inż. M. Gibas	13	Lk2	Lab. Komp.	aktywne
f4097bc1-b05e-4548-aaf5-a8494a6bf5e6	EiAs2	2026-03-05	13:30:00	90	Podstawy elektroniki	dr inż. S. Żaba	06	L1	Laboratoria	aktywne
aa0afd03-d0ae-430e-bea4-4c81d6567b2d	EiAs2	2026-03-05	13:30:00	90	Geometria i grafika inżynierska w AUTOCAD	mgr inż. M. Gibas	13	Lk3	Lab. Komp.	aktywne
4bb0f9f9-644e-465a-9cde-d3a1cf385607	EiAs2	2026-03-05	15:15:00	90	Podstawy elektroniki	dr inż. S. Żaba	06	L2	Laboratoria	aktywne
7ba621cd-93f6-49d7-8d62-59486dc1aca5	EiAs2	2026-03-05	15:15:00	90	Geometria i grafika inżynierska w AUTOCAD	mgr inż. M. Gibas	13	Lk4	Lab. Komp.	aktywne
7e0fb405-5a83-4213-8ff7-6904caaf7179	EiAs2	2026-03-05	17:00:00	90	Podstawy elektroniki	dr inż. S. Żaba	06	L4	Laboratoria	aktywne
4da8f495-576d-44cd-8fa3-b4e4c33ad1a4	EiAs2	2026-03-05	17:00:00	90	Geometria i grafika inżynierska w AUTOCAD	mgr inż. M. Gibas	13	Lk5	Lab. Komp.	aktywne
17ac1780-aebb-4718-ade1-7928063dba03	EiAs2	2026-03-05	17:00:00	90	Programowanie w C++	mgr inż. K. Kopera	101B	Lk4	Lab. Komp.	aktywne
9654e437-e339-4547-acaa-8b3061f1d83a	EiAs2	2026-03-05	18:45:00	90	Podstawy elektroniki	dr inż. S. Żaba	06	L3	Laboratoria	aktywne
33971853-9dff-4516-aaff-390a22db79f7	EiAs2	2026-03-05	18:45:00	90	Geometria i grafika inżynierska w AUTOCAD	mgr inż. M. Gibas	13	P4	Projekt	aktywne
45fbbbf4-0c43-4820-8ae8-d79933c90f53	EiAs2	2026-03-05	18:45:00	90	Programowanie w C++	mgr inż. K. Kopera	101B	Lk5	Lab. Komp.	aktywne
d98b2be1-2086-418f-94cf-b102c0794fdf	EiAs2	2026-03-06	08:15:00	135	Fizyka	K. Suchanek (op), J. Kurzyk, W. Chajec	F115	L1 / L2 / L3	Laboratoria	aktywne
c963c7fe-5ed2-4f18-b4ed-2d94ac5d34cc	EiAs2	2026-03-06	11:00:00	90	Fizyka	W. Chajec	F101	W	Wykład	aktywne
cc9f2e5f-170d-4216-80d4-1714af55a254	EiAs2	2026-03-06	12:45:00	45	Fizyka	W. Chajec	F203	Ć1	Ćwiczenia	aktywne
e4870030-4bb7-4b2b-9602-d4e8e2c78445	EiAs2	2026-03-06	12:45:00	45	Fizyka	E. Borsuk	F204	Ć3	Ćwiczenia	aktywne
3a2f55bf-cd77-4bc0-9d7a-47ba5e171065	EiAs2	2026-03-06	12:45:00	45	Fizyka	B. Burtan-Gwizdała,	F112	Ć2	Ćwiczenia	aktywne
180c8502-e6f3-43a5-8956-bed37ee57808	EiAs2	2026-03-09	07:30:00	135	Analiza matematyczna	dr A. Pudełko	A2	W	Wykład	aktywne
9fb52464-b61c-4a96-9aa6-cfa7a78aa026	EiAs2	2026-03-09	10:00:00	90	Analiza matematyczna	dr A. Pudełko	A2	Ć2	Ćwiczenia	aktywne
d5323c44-3c9d-4e94-8e3c-20a402c70e1b	EiAs2	2026-03-09	10:00:00	90	Język angielski	mgr J. Firganek	136SJO	Lek5	Lektorat	aktywne
146c670c-b613-45d5-a364-c4682c309691	EiAs2	2026-03-09	10:00:00	90	Język angielski	mgr A. Zwierzyńska-Dubis	139SJO	Lek1	Lektorat	aktywne
cff14d9f-0c22-4148-8c81-68ea976f3728	EiAs2	2026-03-09	11:45:00	90	Analiza matematyczna	mgr M. Ból	A2	Ć1	Ćwiczenia	aktywne
0442399d-8fa0-4f90-b643-fb4bf69bc4cf	EiAs2	2026-03-09	11:45:00	90	Język angielski	mgr J. Firganek	136SJO	Lek3	Lektorat	aktywne
6cc2bd23-4d20-4294-86e9-085ba6ad4c30	EiAs2	2026-03-09	11:45:00	90	Język niemiecki	mgr E. Targosz	139SJO	Lek	Lektorat	aktywne
cf6607d0-74f7-413b-bda1-636c8c75874b	EiAs2	2026-03-09	13:30:00	90	Analiza matematyczna	dr J. Czajkowski	A2	Ć3	Ćwiczenia	aktywne
cd936900-d565-4cef-b949-3d7ab4f535f4	EiAs2	2026-03-09	13:30:00	90	Język angielski	mgr J. Firganek	136SJO	Lek2	Lektorat	aktywne
087bf229-d5a4-4a4d-b625-a8d972fe2937	EiAs2	2026-03-09	13:30:00	90	Programowanie w C++	mgr inż. M. Raźny	19	P1	Projekt	aktywne
8fde3f2b-a411-4800-8290-3e32af065cf8	EiAs2	2026-03-09	15:15:00	90	Programowanie w C++	mgr inż. M. Raźny	19	P5	Projekt	aktywne
9daed0d8-15d8-4f5f-a2e8-d65009ced0da	EiAs2	2026-03-09	17:00:00	90	Programowanie w C++	mgr inż. M. Raźny	19	P3	Projekt	aktywne
724d5f3e-0ed5-4a48-a454-72384345272e	EiAs2	2026-03-09	17:00:00	90	Geometria i grafika inżynierska w AUTOCAD	prof. P. Małka	18	P5	Projekt	aktywne
8559a76b-e527-4fc2-866c-44cf4c8f6df7	EiAs2	2026-03-10	07:30:00	90	Geometria i grafika inżynierska w AUTOCAD	prof. P. Małka	12	P2	Projekt	aktywne
f7b1193e-0b52-488a-ba64-0704d44f89ba	EiAs2	2026-03-10	09:15:00	90	Podstawy elektroniki	prof. A. Szromba	A4	W	Wykład	aktywne
d7262fc4-5191-4e11-bc28-66af6e1cc778	EiAs2	2026-03-10	11:00:00	90	Język angielski	mgr A. Zwierzyńska-Dubis	150SJO	Lek4	Lektorat	aktywne
2b3afa1d-9708-467b-a45b-d5c72979e3cd	EiAs2	2026-03-10	11:00:00	90	Podstawy elektroniki	prof. A. Szromba	A4	Ć2	Ćwiczenia	aktywne
584eb5d0-db24-4265-ac09-32b9ceb640a4	EiAs2	2026-03-10	12:45:00	90	Metody numeryczne	dr inż. G. Pędrak	A3	W	Wykład	aktywne
0ea7d45d-34ea-431a-affa-ac406694ee70	EiAs2	2026-03-10	14:30:00	90	Geometria i grafika inżynierska w AUTOCAD	dr inż. Z. Pilch	A4	W	Wykład	aktywne
8ba43107-8514-4aaf-a306-739ca3441cce	EiAs2	2026-03-10	16:15:00	90	Geometria i grafika inżynierska w AUTOCAD	prof. P. Małka	13	Lk6	Lab. Komp.	aktywne
e9faff05-f508-4168-887f-5e390efb1cdf	EiAs2	2026-03-10	18:00:00	90	Programowanie w C++	dr inż. D. Gutenko	19	Lk6	Lab. Komp.	aktywne
2d54187e-629e-4f08-b5f3-4bc70840fbd5	EiAs2	2026-03-10	19:45:00	90	Geometria i grafika inżynierska w AUTOCAD	prof. P. Małka	13	P6	Projekt	aktywne
24281ecf-a020-458c-b6d2-db51fd96ccc1	EiAs2	2026-03-11	11:45:00	90	Podstawy elektroniki	mgr inż. M. Raźny	06	L5	Laboratoria	aktywne
de40abf6-129a-4acd-9720-3e04ebeb28a2	EiAs2	2026-03-11	11:45:00	90	Podstawy elektroniki	prof. A. Szromba	10	Ć3	Ćwiczenia	aktywne
2115c35f-c421-4415-8c0a-950b6c34b6df	EiAs2	2026-03-11	11:45:00	90	Metody numeryczne	dr inż. G. Pędrak	202	Lk1	Lab. Komp.	aktywne
41dd77d3-bf49-4dab-bdcf-a95e4d9bc631	EiAs2	2026-03-11	13:30:00	90	Podstawy elektroniki	mgr inż. M. Raźny	06	L6	Laboratoria	aktywne
ef5581ac-6664-40cd-8b24-f111a0ef5f8a	EiAs2	2026-03-11	13:30:00	90	Metody numeryczne	dr inż. M. Orkisz	202	Lk3	Lab. Komp.	aktywne
e372e68e-7559-4dc5-ba6b-31a28c71d907	EiAs2	2026-03-11	13:30:00	90	Programowanie w C++	dr inż. D. Gutenko	19	Lk1	Lab. Komp.	aktywne
f2b57003-bbab-4159-99ab-dd18d0a39219	EiAs2	2026-03-11	15:15:00	90	Podstawy elektroniki	mgr inż. M. Raźny	06	L7	Laboratoria	aktywne
d6a725b9-eefa-4918-8639-09ad71c4b6ff	EiAs2	2026-03-11	15:15:00	90	Metody numeryczne	dr inż. M. Orkisz	202	Lk4	Lab. Komp.	aktywne
ce3bfab6-9ec2-487b-acd1-e3a46b47ac47	EiAs2	2026-03-11	15:15:00	90	Programowanie w C++	dr inż. D. Gutenko	19	Lk2	Lab. Komp.	aktywne
50fa339b-2002-4b90-93f6-4e31f452261c	EiAs2	2026-03-11	16:15:00	90	Język francuski	mgr B. Heil	139SJO	Lek	Lektorat	aktywne
edab713c-6182-4740-9eef-3e558ea7cbf9	EiAs2	2026-03-11	17:00:00	90	Podstawy elektroniki	mgr inż. M. Raźny	06	L8	Laboratoria	aktywne
ed488a9c-0c4f-4967-90bc-5044bbf2a654	EiAs2	2026-03-11	17:00:00	90	Programowanie w C++	dr inż. D. Gutenko	19	Lk3	Lab. Komp.	aktywne
2d83c324-aee1-48f1-9776-56361d4d0062	EiAs2	2026-03-12	08:15:00	90	Programowanie w C++	dr inż. K. Suchenia	A3	W	Wykład	aktywne
b371aa96-73eb-477b-bec0-b2e1938d204e	EiAs2	2026-03-12	10:00:00	90	Geometria i grafika inżynierska w AUTOCAD	mgr inż. M. Gibas	13	Lk1	Lab. Komp.	aktywne
c56ec6df-7a0f-4398-bbe9-4761e1961c98	EiAs2	2026-03-12	10:00:00	90	Podstawy elektroniki	dr inż. A. Drwal	06	L_dodatkowa	Laboratoria	aktywne
445a9a26-34cf-427a-bf50-566de2150843	EiAs2	2026-03-12	11:45:00	90	Podstawy elektroniki	dr inż. A. Drwal	06	L9	Laboratoria	aktywne
a0118c82-d1ae-4a65-b5ec-6eac83d45719	EiAs2	2026-03-12	11:45:00	90	Geometria i grafika inżynierska w AUTOCAD	mgr inż. M. Gibas	13	Lk2	Lab. Komp.	aktywne
7875a28a-0a16-4c3f-83c4-3e593c40015d	EiAs2	2026-03-12	13:30:00	90	Podstawy elektroniki	dr inż. S. Żaba	06	L1	Laboratoria	aktywne
1a63fe28-401b-4f3a-b752-354b34375b81	EiAs2	2026-03-12	13:30:00	90	Geometria i grafika inżynierska w AUTOCAD	mgr inż. M. Gibas	13	Lk3	Lab. Komp.	aktywne
77d345b5-dabe-4e17-88ed-c95b7334df3f	EiAs2	2026-03-12	15:15:00	90	Podstawy elektroniki	dr inż. S. Żaba	06	L2	Laboratoria	aktywne
c878d59d-63e3-4155-b795-27514e6e99d5	EiAs2	2026-03-12	15:15:00	90	Geometria i grafika inżynierska w AUTOCAD	mgr inż. M. Gibas	13	Lk4	Lab. Komp.	aktywne
2e44aaee-32ee-4784-8895-c03e65715d14	EiAs2	2026-03-12	17:00:00	90	Podstawy elektroniki	dr inż. S. Żaba	06	L4	Laboratoria	aktywne
265a28d5-33a5-452c-9d58-74024a109b97	EiAs2	2026-03-12	17:00:00	90	Geometria i grafika inżynierska w AUTOCAD	mgr inż. M. Gibas	13	Lk5	Lab. Komp.	aktywne
18fe4d35-9cb9-4172-a7f8-987f7d376817	EiAs2	2026-03-12	17:00:00	90	Programowanie w C++	mgr inż. K. Kopera	101B	Lk4	Lab. Komp.	aktywne
93aa8db0-ca8a-41cb-a82d-0120ba910a61	EiAs2	2026-03-12	18:45:00	90	Podstawy elektroniki	dr inż. S. Żaba	06	L3	Laboratoria	aktywne
9fd5691a-83b7-470c-9aaf-e570e854a208	EiAs2	2026-03-12	18:45:00	90	Geometria i grafika inżynierska w AUTOCAD	mgr inż. M. Gibas	13	P3	Projekt	aktywne
f7d2c84f-845d-4419-a408-85d55e42a118	EiAs2	2026-03-12	18:45:00	90	Programowanie w C++	mgr inż. K. Kopera	101B	Lk5	Lab. Komp.	aktywne
f69e02df-4761-41e5-8118-76bc3cd86255	EiAs2	2026-03-13	08:15:00	135	Fizyka	K. Suchanek (op), J. Kurzyk, W. Chajec	F115	L4 / L5 / L6	Laboratoria	aktywne
3ca20c7a-f088-42da-9458-390f51952e3e	EiAs2	2026-03-13	11:00:00	90	Fizyka	W. Chajec	F101	W	Wykład	aktywne
765b2136-641e-4165-98f3-26d92a744566	EiAs2	2026-03-13	12:45:00	45	Fizyka	W. Chajec	F203	Ć1	Ćwiczenia	aktywne
e64a78f5-b668-4c30-8ec3-32cebd2c2fad	EiAs2	2026-03-13	12:45:00	45	Fizyka	E. Borsuk	F204	Ć3	Ćwiczenia	aktywne
b243e79b-cb26-4ee3-aa31-a350f2bfa9fd	EiAs2	2026-03-13	12:45:00	45	Fizyka	B. Burtan-Gwizdała,	F112	Ć2	Ćwiczenia	aktywne
e204537c-f960-432f-a5f2-78f3e30b6119	EiAs2	2026-03-13	13:45:00	135	Fizyka	B. Burtan-Gwizdała (op), M. Duras, E. Borsuk	F115	L7 / L8 / L9	Laboratoria	aktywne
a64f0573-5bcb-4553-bfb9-6603996e1997	EiAs2	2026-03-16	07:30:00	135	Analiza matematyczna	dr A. Pudełko	A2	W	Wykład	aktywne
7755f5d3-8b16-4484-9016-6ee709f1cd9a	EiAs2	2026-03-16	10:00:00	90	Analiza matematyczna	dr A. Pudełko	A2	Ć2	Ćwiczenia	aktywne
bab5682b-7c34-4455-af9d-9bb035d9d6fa	EiAs2	2026-03-16	10:00:00	90	Język angielski	mgr J. Firganek	136SJO	Lek5	Lektorat	aktywne
8e70a8a3-9fea-473c-a8a2-1e8f1c20f188	EiAs2	2026-03-16	10:00:00	90	Język angielski	mgr A. Zwierzyńska-Dubis	139SJO	Lek1	Lektorat	aktywne
86d07425-935d-4837-879d-fa0a6ebadcbe	EiAs2	2026-03-16	11:45:00	90	Analiza matematyczna	mgr M. Ból	A2	Ć1	Ćwiczenia	aktywne
58f90a9a-518f-48ea-bddd-e42e78daca7f	EiAs2	2026-03-16	11:45:00	90	Język angielski	mgr J. Firganek	136SJO	Lek3	Lektorat	aktywne
a9788952-5908-4003-9ce2-326ad3fac2f1	EiAs2	2026-03-16	11:45:00	90	Język niemiecki	mgr E. Targosz	139SJO	Lek	Lektorat	aktywne
010633aa-953e-46b9-a61c-02b82a6aee04	EiAs2	2026-03-16	13:30:00	90	Analiza matematyczna	dr J. Czajkowski	A2	Ć3	Ćwiczenia	aktywne
98eb161a-13b7-47ca-a15a-6c6feb56e983	EiAs2	2026-03-16	13:30:00	90	Język angielski	mgr J. Firganek	136SJO	Lek2	Lektorat	aktywne
be59b177-f17d-498d-ab17-867707aa5864	EiAs2	2026-03-16	13:30:00	90	Programowanie w C++	mgr inż. M. Raźny	19	P4	Projekt	aktywne
249d6b8a-f32a-4deb-8aef-35a8759dcfcb	EiAs2	2026-03-16	15:15:00	90	Programowanie w C++	mgr inż. M. Raźny	19	P2	Projekt	aktywne
74a2d529-d44a-444f-9b31-3c93eb97a3a3	EiAs2	2026-03-16	17:00:00	90	Geometria i grafika inżynierska w AUTOCAD	prof. P. Małka	18	P1	Projekt	aktywne
2ee0b1d9-da31-4ddb-adbd-ef403f49c62c	EiAs2	2026-03-17	09:15:00	90	Podstawy elektroniki	prof. A. Szromba	A4	W	Wykład	aktywne
b85c15b5-835b-4273-b07d-7b0c829915fe	EiAs2	2026-03-17	11:00:00	90	Język angielski	mgr A. Zwierzyńska-Dubis	150SJO	Lek4	Lektorat	aktywne
209511ef-8636-4959-ab80-d4a5126e3c82	EiAs2	2026-03-17	11:00:00	90	Podstawy elektroniki	prof. A. Szromba	A4	Ć1	Ćwiczenia	aktywne
5d8ff71d-e35e-42f2-8da7-6c26b92752ab	EiAs2	2026-03-17	12:45:00	90	Programowanie w C++	dr inż. D. Gutenko	101B	P6	Projekt	aktywne
73d7a653-f435-4a89-a445-3f2148d85315	EiAs2	2026-03-17	16:15:00	90	Geometria i grafika inżynierska w AUTOCAD	prof. P. Małka	13	Lk6	Lab. Komp.	aktywne
4bda2f1f-be35-41ea-bee9-0d9381d601b0	EiAs2	2026-03-17	18:00:00	90	Programowanie w C++	dr inż. D. Gutenko	19	Lk6	Lab. Komp.	aktywne
6f57fe88-15a2-4278-baeb-c0cc157903a0	EiAs2	2026-03-18	11:00:00	135	Metody numeryczne	dr inż. G. Pędrak	202	Lk2	Lab. Komp.	aktywne
63160a86-f91c-4dcc-ad80-7a1170e096e9	EiAs2	2026-03-18	11:45:00	90	Podstawy elektroniki	mgr inż. M. Raźny	06	L5	Laboratoria	aktywne
36f149dc-c7b8-4f2f-bd7a-e1cd1744377e	EiAs2	2026-03-18	11:45:00	90	Podstawy elektroniki	prof. A. Szromba	10	C_dodatkowa	Ćwiczenia	aktywne
c1323077-ea2e-4cff-a907-25639f768f0a	EiAs2	2026-03-18	13:30:00	90	Podstawy elektroniki	mgr inż. M. Raźny	06	L6	Laboratoria	aktywne
28b2e13c-30bf-4b05-be6e-4b1f856ce50c	EiAs2	2026-03-18	13:30:00	90	Metody numeryczne	dr inż. M. Orkisz	202	Lk5	Lab. Komp.	aktywne
bb64e9f9-2c59-4efe-adad-4cf2c3a48977	EiAs2	2026-03-18	13:30:00	90	Programowanie w C++	dr inż. D. Gutenko	19	Lk1	Lab. Komp.	aktywne
654f6db7-aab5-4d0f-84bb-801c0220e758	EiAs2	2026-03-18	15:15:00	90	Podstawy elektroniki	mgr inż. M. Raźny	06	L7	Laboratoria	aktywne
4cbd957b-778d-411b-b052-bd613f83061a	EiAs2	2026-03-18	15:15:00	90	Metody numeryczne	dr inż. M. Orkisz	202	Lk6	Lab. Komp.	aktywne
ae1f41d0-7c4f-4f20-a009-d633e57ed255	EiAs2	2026-03-18	15:15:00	90	Programowanie w C++	dr inż. D. Gutenko	19	Lk2	Lab. Komp.	aktywne
0aad355b-85fd-492a-ac26-7344e8de33d6	EiAs2	2026-03-18	16:15:00	90	Język francuski	mgr B. Heil	139SJO	Lek	Lektorat	aktywne
5489cdc4-b9f7-4ae9-b836-b5e9efafb5f3	EiAs2	2026-03-18	17:00:00	90	Podstawy elektroniki	mgr inż. M. Raźny	06	L8	Laboratoria	aktywne
9e0475c2-6cd6-4533-b6d4-3abede58c40a	EiAs2	2026-03-18	17:00:00	90	Programowanie w C++	dr inż. D. Gutenko	19	Lk3	Lab. Komp.	aktywne
808f4bb1-b621-489a-b888-eb7885c2855e	EiAs2	2026-03-19	08:15:00	90	Programowanie w C++	dr inż. D. Gutenko	A3	W	Wykład	aktywne
d04268eb-1b64-4c50-852a-ff5d02237969	EiAs2	2026-03-19	10:00:00	90	Geometria i grafika inżynierska w AUTOCAD	mgr inż. M. Gibas	13	Lk1	Lab. Komp.	aktywne
653de1e3-3e63-4fbf-be49-875c7613b237	EiAs2	2026-03-19	10:00:00	90	Podstawy elektroniki	dr inż. A. Drwal	06	L_dodatkowa	Laboratoria	aktywne
ed67070d-687b-4ccb-8e23-028d1cb77806	EiAs2	2026-03-19	11:45:00	90	Podstawy elektroniki	dr inż. A. Drwal	06	L9	Laboratoria	aktywne
209528c8-6a6f-475b-996a-99d547303362	EiAs2	2026-05-03	07:00:00	900	Majówka	Brak	-	Wszystkie grupy	święto	wolne
0c48c9aa-e8a4-4329-929f-75c9f963eb37	EiAs2	2026-03-19	11:45:00	90	Geometria i grafika inżynierska w AUTOCAD	mgr inż. M. Gibas	13	Lk2	Lab. Komp.	aktywne
259605d2-aca7-4713-b8c9-41078a63ddd8	EiAs2	2026-03-19	13:30:00	90	Podstawy elektroniki	dr inż. S. Żaba	06	L1	Laboratoria	aktywne
8d290096-64a9-4de6-8816-260def6a9a46	EiAs2	2026-03-19	13:30:00	90	Geometria i grafika inżynierska w AUTOCAD	mgr inż. M. Gibas	13	Lk3	Lab. Komp.	aktywne
9d05bd60-6dd6-4caf-adcc-f86ce477af30	EiAs2	2026-03-19	15:15:00	90	Podstawy elektroniki	dr inż. S. Żaba	06	L2	Laboratoria	aktywne
47e030af-fee4-456a-bd7f-5bab556aa99a	EiAs2	2026-03-19	15:15:00	90	Geometria i grafika inżynierska w AUTOCAD	mgr inż. M. Gibas	13	Lk4	Lab. Komp.	aktywne
22584053-2ec4-4f4a-8c87-b29ce7857545	EiAs2	2026-03-19	17:00:00	90	Podstawy elektroniki	dr inż. S. Żaba	06	L4	Laboratoria	aktywne
8f64e781-81eb-46e5-a627-e1f18d33beda	EiAs2	2026-03-19	17:00:00	90	Geometria i grafika inżynierska w AUTOCAD	mgr inż. M. Gibas	13	Lk5	Lab. Komp.	aktywne
b427e0ce-c74c-4099-80d7-20a36b436da3	EiAs2	2026-03-19	17:00:00	90	Programowanie w C++	mgr inż. K. Kopera	101B	Lk4	Lab. Komp.	aktywne
dc55efc3-28c6-48e7-90e9-f4cc79505016	EiAs2	2026-03-19	18:45:00	90	Podstawy elektroniki	dr inż. S. Żaba	06	L3	Laboratoria	aktywne
7ac79813-2103-4d94-b908-b77bf701717e	EiAs2	2026-03-19	18:45:00	90	Geometria i grafika inżynierska w AUTOCAD	mgr inż. M. Gibas	13	P4	Projekt	aktywne
a15474ef-a4f3-4936-bfc1-e5b905502e89	EiAs2	2026-03-19	18:45:00	90	Programowanie w C++	mgr inż. K. Kopera	101B	Lk5	Lab. Komp.	aktywne
a2e5586d-f9f2-4336-9100-5bb213e314d0	EiAs2	2026-03-20	08:15:00	135	Fizyka	K. Suchanek (op), J. Kurzyk, W. Chajec	F115	L1 / L2 / L3	Laboratoria	aktywne
e974f3fa-356f-44c2-9f4b-5bd18bcc09c4	EiAs2	2026-03-20	11:00:00	90	Fizyka	W. Chajec	F101	W	Wykład	aktywne
ac2400ec-73fa-4172-80eb-f14253d10fd3	EiAs2	2026-03-20	12:45:00	45	Fizyka	W. Chajec	F203	Ć1	Ćwiczenia	aktywne
6d08f399-dd53-4bf7-b60f-416847dc8cd6	EiAs2	2026-03-20	12:45:00	45	Fizyka	E. Borsuk	F204	Ć3	Ćwiczenia	aktywne
db36991d-1fe2-4d1f-b552-4721104ff5b7	EiAs2	2026-03-20	12:45:00	45	Fizyka	B. Burtan-Gwizdała,	F112	Ć2	Ćwiczenia	aktywne
0100eac9-dfc9-4e9b-bc5f-d692c2e02ccd	EiAs2	2026-03-23	07:30:00	135	Analiza matematyczna	dr A. Pudełko	A2	W	Wykład	aktywne
50745b6c-a769-4d10-8ad2-e9688979437f	EiAs2	2026-03-23	10:00:00	90	Analiza matematyczna	dr A. Pudełko	A2	Ć2	Ćwiczenia	aktywne
4c0be6ac-2510-4b53-9e21-df29c29b2b06	EiAs2	2026-03-23	10:00:00	90	Język angielski	mgr J. Firganek	136SJO	Lek5	Lektorat	aktywne
3216c8bf-d15e-4dc8-b4ae-ca30cdfc3da7	EiAs2	2026-03-23	10:00:00	90	Język angielski	mgr A. Zwierzyńska-Dubis	139SJO	Lek1	Lektorat	aktywne
234f81ab-e3ff-4078-8bfe-807470f459eb	EiAs2	2026-03-23	11:45:00	90	Analiza matematyczna	mgr M. Ból	A2	Ć1	Ćwiczenia	aktywne
20020816-e16c-4768-b194-1a0782563580	EiAs2	2026-03-23	11:45:00	90	Język angielski	mgr J. Firganek	136SJO	Lek3	Lektorat	aktywne
1c1c56ad-54e6-4d50-8dc1-549c0fe8e7f0	EiAs2	2026-03-23	11:45:00	90	Język niemiecki	mgr E. Targosz	139SJO	Lek	Lektorat	aktywne
e5deb221-4f27-499e-8b1a-6e6073918daf	EiAs2	2026-03-23	13:30:00	90	Analiza matematyczna	dr J. Czajkowski	A2	Ć3	Ćwiczenia	aktywne
07e06707-a8a1-45c3-836d-f4129fdda6c8	EiAs2	2026-03-23	13:30:00	90	Język angielski	mgr J. Firganek	136SJO	Lek2	Lektorat	aktywne
5ea67c10-f59d-4ad0-a2e3-a5e9054a01c5	EiAs2	2026-03-23	13:30:00	90	Programowanie w C++	mgr inż. M. Raźny	19	P1	Projekt	aktywne
a59b4b80-4c6e-4f46-bec4-81365bfcde4e	EiAs2	2026-03-23	15:15:00	90	Programowanie w C++	mgr inż. M. Raźny	19	P5	Projekt	aktywne
b781121e-d8dc-474f-946e-5d556508559e	EiAs2	2026-03-23	17:00:00	90	Programowanie w C++	mgr inż. M. Raźny	19	P3	Projekt	aktywne
f6b7e6aa-6f04-48a5-83ab-c2f660eaaf90	EiAs2	2026-03-23	17:00:00	90	Geometria i grafika inżynierska w AUTOCAD	prof. P. Małka	18	P5	Projekt	aktywne
8016b860-fde4-4929-baa6-86d463b618ce	EiAs2	2026-03-24	07:30:00	90	Geometria i grafika inżynierska w AUTOCAD	prof. P. Małka	12	P2	Projekt	aktywne
cb1495e4-f650-4155-bdc5-46bc542e4d9b	EiAs2	2026-03-24	09:15:00	90	Podstawy elektroniki	prof. A. Szromba	A4	W	Wykład	aktywne
48f0e601-26ac-4347-8fdb-0f8e3154c57a	EiAs2	2026-03-24	11:00:00	90	Język angielski	mgr A. Zwierzyńska-Dubis	150SJO	Lek4	Lektorat	aktywne
e47397af-faac-4f7b-b38a-d08cc46f5d29	EiAs2	2026-03-24	11:00:00	90	Podstawy elektroniki	prof. A. Szromba	A4	Ć2	Ćwiczenia	aktywne
b05e5f21-1d33-4ae3-bc57-a574d1682210	EiAs2	2026-03-24	12:45:00	90	Metody numeryczne	dr inż. G. Pędrak	A3	W	Wykład	aktywne
a1af8442-40cd-4676-bc7c-d5142c7f3bf9	EiAs2	2026-03-24	14:30:00	90	Geometria i grafika inżynierska w AUTOCAD	dr inż. Z. Pilch	A4	W	Wykład	aktywne
da1425ab-500b-41d4-8bbe-48ca75d33865	EiAs2	2026-03-24	16:15:00	90	Geometria i grafika inżynierska w AUTOCAD	prof. P. Małka	13	Lk6	Lab. Komp.	aktywne
304636fb-5376-4a28-b60f-802580dba4f6	EiAs2	2026-03-24	18:00:00	90	Programowanie w C++	dr inż. D. Gutenko	19	Lk6	Lab. Komp.	aktywne
56a34e28-e8a7-479b-87ac-69eb60717859	EiAs2	2026-03-24	19:45:00	90	Geometria i grafika inżynierska w AUTOCAD	prof. P. Małka	13	P6	Projekt	aktywne
a07bb51f-a73f-425f-83b4-f1a4ada6e768	EiAs2	2026-03-25	11:45:00	90	Podstawy elektroniki	mgr inż. M. Raźny	06	L5	Laboratoria	aktywne
6b1d3a8b-129f-416a-bb30-b1db0a11ca1c	EiAs2	2026-03-25	11:45:00	90	Podstawy elektroniki	prof. A. Szromba	10	Ć3	Ćwiczenia	aktywne
96b4fc31-8ff5-41ec-8021-f048e366d22c	EiAs2	2026-03-25	11:45:00	90	Metody numeryczne	dr inż. G. Pędrak	202	Lk1	Lab. Komp.	aktywne
8f644dec-9d6c-4d1e-9600-4f6e42c8fde5	EiAs2	2026-03-25	13:30:00	90	Podstawy elektroniki	mgr inż. M. Raźny	06	L6	Laboratoria	aktywne
939ad93f-fc05-413e-97fa-094653852d5e	EiAs2	2026-03-25	13:30:00	90	Metody numeryczne	dr inż. M. Orkisz	202	Lk3	Lab. Komp.	aktywne
e5e8eb69-0c3d-4efb-bb6e-3a09aec3cfe3	EiAs2	2026-03-25	13:30:00	90	Programowanie w C++	dr inż. D. Gutenko	19	Lk1	Lab. Komp.	aktywne
6e9859da-8cae-4aaf-9703-706be6cfe752	EiAs2	2026-03-25	15:15:00	90	Podstawy elektroniki	mgr inż. M. Raźny	06	L7	Laboratoria	aktywne
607356dd-ff1d-4ab8-8c83-2885d97296a4	EiAs2	2026-03-25	15:15:00	90	Metody numeryczne	dr inż. M. Orkisz	202	Lk4	Lab. Komp.	aktywne
e5c616f2-c557-450e-a562-1adde27ccafa	EiAs2	2026-03-25	15:15:00	90	Programowanie w C++	dr inż. D. Gutenko	19	Lk2	Lab. Komp.	aktywne
13fd68eb-8b4b-476e-b526-7891cab57bbd	EiAs2	2026-03-25	16:15:00	90	Język francuski	mgr B. Heil	139SJO	Lek	Lektorat	aktywne
4bf5989b-669a-4633-a808-aa8438a54712	EiAs2	2026-03-25	17:00:00	90	Podstawy elektroniki	mgr inż. M. Raźny	06	L8	Laboratoria	aktywne
84a34140-fb00-452d-89cc-6f631b71e5c3	EiAs2	2026-03-25	17:00:00	90	Programowanie w C++	dr inż. D. Gutenko	19	Lk3	Lab. Komp.	aktywne
240fc188-4dca-4fa5-b472-48525d932953	EiAs2	2026-03-26	08:15:00	90	Programowanie w C++	dr inż. D. Gutenko	A3	W	Wykład	aktywne
d41c76f6-8f54-42f2-afaf-6fd2956a7cfa	EiAs2	2026-03-26	10:00:00	90	Geometria i grafika inżynierska w AUTOCAD	mgr inż. M. Gibas	13	Lk1	Lab. Komp.	aktywne
af76d4ec-c3ff-47e6-ae98-9fed93263aea	EiAs2	2026-03-26	10:00:00	90	Podstawy elektroniki	dr inż. A. Drwal	06	L_dodatkowa	Laboratoria	aktywne
d7a55165-1080-4fc0-aa0c-77ef4fa1db12	EiAs2	2026-03-26	11:45:00	90	Podstawy elektroniki	dr inż. A. Drwal	06	L9	Laboratoria	aktywne
2174475f-993d-4a5f-8ea6-36ae7b201134	EiAs2	2026-03-26	11:45:00	90	Geometria i grafika inżynierska w AUTOCAD	mgr inż. M. Gibas	13	Lk2	Lab. Komp.	aktywne
5be8db3d-59f0-4a36-8377-63a8da1e1c68	EiAs2	2026-03-26	13:30:00	90	Podstawy elektroniki	dr inż. S. Żaba	06	L1	Laboratoria	aktywne
5bddb001-ea36-4114-9064-b55eac9588ee	EiAs2	2026-05-04	07:00:00	900	Majówka	Brak	-	Wszystkie grupy	święto	wolne
ef453e50-90ec-48ef-9ca5-27f9cd8d006f	EiAs2	2026-03-26	13:30:00	90	Geometria i grafika inżynierska w AUTOCAD	mgr inż. M. Gibas	13	Lk3	Lab. Komp.	aktywne
10cff40e-f5ee-422c-a76e-52a9566301af	EiAs2	2026-03-26	15:15:00	90	Podstawy elektroniki	dr inż. S. Żaba	06	L2	Laboratoria	aktywne
37934bc8-41b7-420b-8811-f708634a7bfa	EiAs2	2026-03-26	15:15:00	90	Geometria i grafika inżynierska w AUTOCAD	mgr inż. M. Gibas	13	Lk4	Lab. Komp.	aktywne
c06fab77-a598-49b1-8dc0-d30098103c26	EiAs2	2026-03-26	17:00:00	90	Podstawy elektroniki	dr inż. S. Żaba	06	L4	Laboratoria	aktywne
fb809017-20a1-4b59-887f-cc233ad44d60	EiAs2	2026-03-26	17:00:00	90	Geometria i grafika inżynierska w AUTOCAD	mgr inż. M. Gibas	13	Lk5	Lab. Komp.	aktywne
b760a89f-595a-4f38-8ae2-3938e9846b1d	EiAs2	2026-03-26	17:00:00	90	Programowanie w C++	mgr inż. K. Kopera	101B	Lk4	Lab. Komp.	aktywne
ef9b1b47-cf16-428e-a88d-38903c63e97e	EiAs2	2026-03-26	18:45:00	90	Podstawy elektroniki	dr inż. S. Żaba	06	L3	Laboratoria	aktywne
0fa982a9-511f-4706-aad0-35e3fd7ede28	EiAs2	2026-03-26	18:45:00	90	Geometria i grafika inżynierska w AUTOCAD	mgr inż. M. Gibas	13	P3	Projekt	aktywne
8eb7563f-6116-46a9-84f7-b4db1de6588c	EiAs2	2026-03-26	18:45:00	90	Programowanie w C++	mgr inż. K. Kopera	101B	Lk5	Lab. Komp.	aktywne
692bfd39-8cd1-4de0-bbf2-11d682c83b3a	EiAs2	2026-03-27	08:15:00	135	Fizyka	K. Suchanek (op), J. Kurzyk, W. Chajec	F115	L4 / L5 / L6	Laboratoria	aktywne
4f03837d-0db9-4acf-8375-cf512a6911fe	EiAs2	2026-03-27	11:00:00	90	Fizyka	W. Chajec	F101	W	Wykład	aktywne
43353b4e-61e6-4fc7-98dc-ceccdf709138	EiAs2	2026-03-27	12:45:00	45	Fizyka	W. Chajec	F203	Ć1	Ćwiczenia	aktywne
5d856f94-2ec2-48b2-ad36-db30459fb677	EiAs2	2026-03-27	12:45:00	45	Fizyka	E. Borsuk	F204	Ć3	Ćwiczenia	aktywne
9a3b2115-c298-4b97-bdaa-d50e7c5bef9b	EiAs2	2026-03-27	12:45:00	45	Fizyka	B. Burtan-Gwizdała,	F112	Ć2	Ćwiczenia	aktywne
375643da-8ca6-4fbe-b810-10df7d3a2209	EiAs2	2026-03-27	13:45:00	135	Fizyka	B. Burtan-Gwizdała (op), M. Duras, E. Borsuk	F115	L7 / L8 / L9	Laboratoria	aktywne
321f724e-7af2-40a9-89fa-30163a9350ac	EiAs2	2026-03-30	07:30:00	135	Analiza matematyczna	dr A. Pudełko	A2	W	Wykład	aktywne
75c1a4c8-894c-45d1-8ae6-31bb3d62b423	EiAs2	2026-03-30	10:00:00	90	Analiza matematyczna	dr A. Pudełko	A2	Ć2	Ćwiczenia	aktywne
d2a84453-1112-4bf0-8db2-9c2ea5d81301	EiAs2	2026-03-30	10:00:00	90	Język angielski	mgr J. Firganek	136SJO	Lek5	Lektorat	aktywne
c7965d38-6072-4941-be00-f16504f6f3f5	EiAs2	2026-03-30	10:00:00	90	Język angielski	mgr A. Zwierzyńska-Dubis	139SJO	Lek1	Lektorat	aktywne
b0821d9c-78ff-4017-8aad-3ab962298bdc	EiAs2	2026-03-30	11:45:00	90	Analiza matematyczna	mgr M. Ból	A2	Ć1	Ćwiczenia	aktywne
dae15d0e-7fcc-4e89-88ca-be491a33d58b	EiAs2	2026-03-30	11:45:00	90	Język angielski	mgr J. Firganek	136SJO	Lek3	Lektorat	aktywne
bb753371-b76a-44e7-879f-31d1b00a10b3	EiAs2	2026-03-30	11:45:00	90	Język niemiecki	mgr E. Targosz	139SJO	Lek	Lektorat	aktywne
74ad3df9-ca72-4083-9682-8a3d97dedb12	EiAs2	2026-03-30	13:30:00	90	Analiza matematyczna	dr J. Czajkowski	A2	Ć3	Ćwiczenia	aktywne
1bfff0cd-3d3e-41b4-81df-b8871f51608a	EiAs2	2026-03-30	13:30:00	90	Język angielski	mgr J. Firganek	136SJO	Lek2	Lektorat	aktywne
010f1264-11d3-4580-a6f2-7a78cb6dcf2a	EiAs2	2026-03-30	13:30:00	90	Programowanie w C++	mgr inż. M. Raźny	19	P4	Projekt	aktywne
e8c06dfa-a8a8-4009-bbec-b5833cc77917	EiAs2	2026-03-30	15:15:00	90	Programowanie w C++	mgr inż. M. Raźny	19	P2	Projekt	aktywne
7f41d031-adef-4bdf-acd2-538e9e792c18	EiAs2	2026-03-30	17:00:00	90	Geometria i grafika inżynierska w AUTOCAD	prof. P. Małka	18	P1	Projekt	aktywne
3661fc73-2e5d-4007-b458-43d448ce99f3	EiAs2	2026-03-31	09:15:00	90	Podstawy elektroniki	prof. A. Szromba	A4	W	Wykład	aktywne
a8093166-52f8-4501-bcbd-f815aa5fed65	EiAs2	2026-03-31	11:00:00	90	Język angielski	mgr A. Zwierzyńska-Dubis	150SJO	Lek4	Lektorat	aktywne
7a81bd35-9484-473e-9c0f-8aa3b6aa4105	EiAs2	2026-03-31	11:00:00	90	Podstawy elektroniki	prof. A. Szromba	A4	Ć1	Ćwiczenia	aktywne
178af2bc-7c0a-449b-9826-56e89daba873	EiAs2	2026-03-31	12:45:00	90	Programowanie w C++	dr inż. D. Gutenko	101B	P6	Projekt	aktywne
8d0161db-f9d2-4897-9da7-b51cd55702b3	EiAs2	2026-03-31	16:15:00	90	Geometria i grafika inżynierska w AUTOCAD	prof. P. Małka	13	Lk6	Lab. Komp.	aktywne
7928886d-a309-4a68-a78e-f611bd355b4a	EiAs2	2026-03-31	18:00:00	90	Programowanie w C++	dr inż. D. Gutenko	19	Lk6	Lab. Komp.	aktywne
413d7362-d2af-4e22-a168-21e851fd3531	EiAs2	2026-04-01	07:00:00	900	Przerwa świąteczna	Brak	-	Wszystkie grupy	święto	wolne
90527faf-eb65-4bb4-a3e6-bbbf1d4cc477	EiAs2	2026-04-02	07:00:00	900	Przerwa świąteczna	Brak	-	Wszystkie grupy	święto	wolne
bcf2b681-4ba3-44a9-8136-e050ef0455f5	EiAs2	2026-04-03	07:00:00	900	Przerwa świąteczna	Brak	-	Wszystkie grupy	święto	wolne
5f507bcf-a8d9-4bfd-80a7-0eeb6155e4c5	EiAs2	2026-04-04	07:00:00	900	Przerwa świąteczna	Brak	-	Wszystkie grupy	święto	wolne
00fc344f-6d58-4ae5-9d86-b59b7b3c6152	EiAs2	2026-04-05	07:00:00	900	Przerwa świąteczna	Brak	-	Wszystkie grupy	święto	wolne
7e5d8985-cd4c-45b5-8ad4-f92a7ee928cd	EiAs2	2026-04-06	07:00:00	900	Przerwa świąteczna	Brak	-	Wszystkie grupy	święto	wolne
afbc2821-9be3-47a7-b8a9-11e50f58d41e	EiAs2	2026-04-07	07:00:00	900	Przerwa świąteczna	Brak	-	Wszystkie grupy	święto	wolne
78d6f006-02c1-4181-aefe-7464d6810090	EiAs2	2026-04-08	11:45:00	90	Podstawy elektroniki	mgr inż. M. Raźny	06	L5	Laboratoria	aktywne
e0f2a6bc-ee44-4bcc-8e35-77ae5ba6878a	EiAs2	2026-04-08	11:45:00	90	Podstawy elektroniki	prof. A. Szromba	10	Ć3	Ćwiczenia	aktywne
e1a0be27-a300-4712-8f1d-7477c566d23b	EiAs2	2026-04-08	11:45:00	90	Metody numeryczne	dr inż. G. Pędrak	202	Lk1	Lab. Komp.	aktywne
89fc002d-38a2-44d2-af06-443019a78cbc	EiAs2	2026-04-08	13:30:00	90	Podstawy elektroniki	mgr inż. M. Raźny	06	L6	Laboratoria	aktywne
838984f5-e30c-43d4-9619-fbc137be5fc4	EiAs2	2026-04-08	13:30:00	90	Metody numeryczne	dr inż. M. Orkisz	202	Lk3	Lab. Komp.	aktywne
eeefc6cb-de7b-46ba-93d9-d49d3518a6df	EiAs2	2026-04-08	13:30:00	90	Programowanie w C++	dr inż. D. Gutenko	19	Lk1	Lab. Komp.	aktywne
4ed91c7b-1faa-4a05-be0c-957524a9c39f	EiAs2	2026-04-08	15:15:00	90	Podstawy elektroniki	mgr inż. M. Raźny	06	L7	Laboratoria	aktywne
b9eda13f-96bf-40a7-872c-f3d4b3abfbd8	EiAs2	2026-04-08	15:15:00	90	Metody numeryczne	dr inż. M. Orkisz	202	Lk4	Lab. Komp.	aktywne
a09ee60a-30ac-445a-b783-b89a75eee268	EiAs2	2026-04-08	15:15:00	90	Programowanie w C++	dr inż. D. Gutenko	19	Lk2	Lab. Komp.	aktywne
72bc91fc-0443-4313-b938-468f6e1523b7	EiAs2	2026-04-08	16:15:00	90	Język francuski	mgr B. Heil	139SJO	Lek	Lektorat	aktywne
40d63617-b931-4325-8da0-5f836ab98d83	EiAs2	2026-04-08	17:00:00	90	Podstawy elektroniki	mgr inż. M. Raźny	06	L8	Laboratoria	aktywne
6b8d4147-4fb4-43b0-9446-ad4deadc86f9	EiAs2	2026-04-08	17:00:00	90	Programowanie w C++	dr inż. D. Gutenko	19	Lk3	Lab. Komp.	aktywne
54353ebe-cf72-4425-9264-1eb9528366ad	EiAs2	2026-04-09	08:15:00	90	Programowanie w C++	dr inż. D. Gutenko	A3	W	Wykład	aktywne
97471f9a-bf3e-47c5-83d5-98361c3bb507	EiAs2	2026-04-09	10:00:00	90	Geometria i grafika inżynierska w AUTOCAD	mgr inż. M. Gibas	13	Lk1	Lab. Komp.	aktywne
10121e98-365d-4a57-b32e-70e70f775ad6	EiAs2	2026-04-09	10:00:00	90	Podstawy elektroniki	dr inż. A. Drwal	06	L_dodatkowa	Laboratoria	aktywne
161f1583-a4fe-4ed0-baa7-0d2164c397d5	EiAs2	2026-04-09	11:45:00	90	Podstawy elektroniki	dr inż. A. Drwal	06	L9	Laboratoria	aktywne
e212c7e6-1ca7-4bc4-987f-85d9a3b501af	EiAs2	2026-04-09	11:45:00	90	Geometria i grafika inżynierska w AUTOCAD	mgr inż. M. Gibas	13	Lk2	Lab. Komp.	aktywne
bc6cab94-a9e4-45a1-a9af-48015b3e52b0	EiAs2	2026-04-09	13:30:00	90	Podstawy elektroniki	dr inż. S. Żaba	06	L1	Laboratoria	aktywne
fbc344e2-4a09-417a-905b-1ff2c3de60e6	EiAs2	2026-04-09	13:30:00	90	Geometria i grafika inżynierska w AUTOCAD	mgr inż. M. Gibas	13	Lk3	Lab. Komp.	aktywne
1557eb11-6326-41c4-8cec-f8fa9472cb47	EiAs2	2026-04-09	15:15:00	90	Podstawy elektroniki	dr inż. S. Żaba	06	L2	Laboratoria	aktywne
3a24d656-2fe2-4fc5-aa10-0fdcceb691af	EiAs2	2026-04-09	15:15:00	90	Geometria i grafika inżynierska w AUTOCAD	mgr inż. M. Gibas	13	Lk4	Lab. Komp.	aktywne
a241f25a-5a29-45f9-bbe9-36762cc5b9ee	EiAs2	2026-04-09	17:00:00	90	Podstawy elektroniki	dr inż. S. Żaba	06	L4	Laboratoria	aktywne
873d52c4-533c-46e8-ba82-57d3927353fb	EiAs2	2026-04-09	17:00:00	90	Geometria i grafika inżynierska w AUTOCAD	mgr inż. M. Gibas	13	Lk5	Lab. Komp.	aktywne
c66ac830-9ae0-4407-800b-a96f90b2302f	EiAs2	2026-04-09	17:00:00	90	Programowanie w C++	mgr inż. K. Kopera	101B	Lk4	Lab. Komp.	aktywne
11d8f171-ee96-47fb-b69c-6bb77a7dc921	EiAs2	2026-04-09	18:45:00	90	Podstawy elektroniki	dr inż. S. Żaba	06	L3	Laboratoria	aktywne
627c8ef9-3653-4a01-856e-bdc13a27cdc6	EiAs2	2026-04-09	18:45:00	90	Geometria i grafika inżynierska w AUTOCAD	mgr inż. M. Gibas	13	P3	Projekt	aktywne
3507e207-c5cc-4f25-afde-05e38cf7da3f	EiAs2	2026-04-09	18:45:00	90	Programowanie w C++	mgr inż. K. Kopera	101B	Lk5	Lab. Komp.	aktywne
4a1276ea-2ffb-479b-af2d-666ffd9b282c	EiAs2	2026-04-10	08:15:00	135	Fizyka	K. Suchanek (op), J. Kurzyk, W. Chajec	F115	L4 / L5 / L6	Laboratoria	aktywne
743ade55-9d78-4a80-9c81-d413f79207c3	EiAs2	2026-04-10	11:00:00	90	Fizyka	W. Chajec	F101	W	Wykład	aktywne
8a3ed480-5f40-4a92-991e-f89f6fbb47b0	EiAs2	2026-04-10	12:45:00	45	Fizyka	W. Chajec	F203	Ć1	Ćwiczenia	aktywne
86a46716-33b3-4bdd-911f-ef1eb11cc451	EiAs2	2026-04-10	12:45:00	45	Fizyka	E. Borsuk	F204	Ć3	Ćwiczenia	aktywne
1585a04d-4631-4dd9-a129-7e284fd03567	EiAs2	2026-04-10	12:45:00	45	Fizyka	B. Burtan-Gwizdała,	F112	Ć2	Ćwiczenia	aktywne
ba8f00f1-2d6f-4a7a-aa6b-53bf7773d8f1	EiAs2	2026-04-10	13:45:00	135	Fizyka	B. Burtan-Gwizdała (op), M. Duras, E. Borsuk	F115	L7 / L8 / L9	Laboratoria	aktywne
a8014bf4-c615-4d21-a6e7-eafed7089e54	EiAs2	2026-04-13	07:30:00	135	Analiza matematyczna	dr A. Pudełko	A2	W	Wykład	aktywne
d2e11501-e224-4fcf-b39c-f3e774e60c95	EiAs2	2026-04-13	10:00:00	90	Analiza matematyczna	dr A. Pudełko	A2	Ć2	Ćwiczenia	aktywne
98af0ce3-ec95-41e2-9e7d-6574a8b67ca3	EiAs2	2026-04-13	10:00:00	90	Język angielski	mgr J. Firganek	136SJO	Lek5	Lektorat	aktywne
190deaea-0491-4350-b49d-8b6db58dd1e1	EiAs2	2026-04-13	10:00:00	90	Język angielski	mgr A. Zwierzyńska-Dubis	139SJO	Lek1	Lektorat	aktywne
0b97ad05-c4bf-4d5b-95a8-1ec76ab800a9	EiAs2	2026-04-13	11:45:00	90	Analiza matematyczna	mgr M. Ból	A2	Ć1	Ćwiczenia	aktywne
391fd650-89be-45e8-a2d1-736f4b080529	EiAs2	2026-04-13	11:45:00	90	Język angielski	mgr J. Firganek	136SJO	Lek3	Lektorat	aktywne
8ff5c692-61cf-45fc-be99-cba29273446b	EiAs2	2026-04-13	11:45:00	90	Język niemiecki	mgr E. Targosz	139SJO	Lek	Lektorat	aktywne
99a35cb8-4b0c-47ad-a82f-01c55e3dd2f3	EiAs2	2026-04-13	13:30:00	90	Analiza matematyczna	dr J. Czajkowski	A2	Ć3	Ćwiczenia	aktywne
42901e40-2b93-4317-91a3-0766ef24c7e3	EiAs2	2026-04-13	13:30:00	90	Język angielski	mgr J. Firganek	136SJO	Lek2	Lektorat	aktywne
b3d68a14-10a2-48eb-bd24-e54b40a0dede	EiAs2	2026-04-13	13:30:00	90	Programowanie w C++	mgr inż. M. Raźny	19	P4	Projekt	aktywne
559bdff7-69fc-4af7-97dc-cf1bb9a57680	EiAs2	2026-04-13	15:15:00	90	Programowanie w C++	mgr inż. M. Raźny	19	P2	Projekt	aktywne
78c08fb1-5b32-4b37-80d2-1855ef2e672b	EiAs2	2026-04-13	17:00:00	90	Geometria i grafika inżynierska w AUTOCAD	prof. P. Małka	18	P1	Projekt	aktywne
5f3d1bc2-57c3-4d85-8d49-9635edf70dce	EiAs2	2026-04-14	09:15:00	90	Podstawy elektroniki	prof. A. Szromba	A4	W	Wykład	aktywne
530f07cb-00e3-4388-8760-a81bf0ec6661	EiAs2	2026-04-14	11:00:00	90	Język angielski	mgr A. Zwierzyńska-Dubis	150SJO	Lek4	Lektorat	aktywne
548ad6a3-c686-4053-a40a-a4a2b40e8b00	EiAs2	2026-04-14	11:00:00	90	Podstawy elektroniki	prof. A. Szromba	A4	Ć1	Ćwiczenia	aktywne
896a07c8-2033-466e-a8fd-0ef5388e5035	EiAs2	2026-04-14	12:45:00	90	Programowanie w C++	dr inż. D. Gutenko	101B	P6	Projekt	aktywne
28199d94-a815-4794-b99c-27c5e2bdb6d4	EiAs2	2026-04-14	16:15:00	90	Geometria i grafika inżynierska w AUTOCAD	prof. P. Małka	13	Lk6	Lab. Komp.	aktywne
22dc8500-af4d-4696-ae2a-d0ae86775275	EiAs2	2026-04-14	18:00:00	90	Programowanie w C++	dr inż. D. Gutenko	19	Lk6	Lab. Komp.	aktywne
7ab7face-a58e-46d2-8115-7284ad3c2b56	EiAs2	2026-04-15	11:45:00	90	Podstawy elektroniki	mgr inż. M. Raźny	06	L5	Laboratoria	aktywne
b99d9232-d86c-4ffc-ba20-042f154bd155	EiAs2	2026-04-15	11:45:00	90	Metody numeryczne	dr inż. G. Pędrak	202	Lk2	Lab. Komp.	aktywne
1da380f6-cb86-4358-8161-aa27ff44afb4	EiAs2	2026-04-15	11:45:00	90	Podstawy elektroniki	prof. A. Szromba	10	C_dodatkowa	Ćwiczenia	aktywne
3dd7be7a-091c-40e5-ba29-7b8216b0feca	EiAs2	2026-04-15	13:30:00	90	Podstawy elektroniki	mgr inż. M. Raźny	06	L6	Laboratoria	aktywne
cb63e429-106d-42b3-8dad-823527505dc3	EiAs2	2026-04-15	13:30:00	90	Metody numeryczne	dr inż. M. Orkisz	202	Lk5	Lab. Komp.	aktywne
fe46eedd-c0ac-4f7c-be94-7fcda5b72bc4	EiAs2	2026-04-15	13:30:00	90	Programowanie w C++	dr inż. D. Gutenko	19	Lk1	Lab. Komp.	aktywne
c63bef97-dd85-4aa5-b343-b108f9937710	EiAs2	2026-04-15	15:15:00	90	Podstawy elektroniki	mgr inż. M. Raźny	06	L7	Laboratoria	aktywne
0973d762-8864-4b41-b050-45e1cf540cfc	EiAs2	2026-04-15	15:15:00	90	Metody numeryczne	dr inż. M. Orkisz	202	Lk6	Lab. Komp.	aktywne
3db37f21-9c56-45ff-9ef8-73f4ec7b78f4	EiAs2	2026-04-15	15:15:00	90	Programowanie w C++	dr inż. D. Gutenko	19	Lk2	Lab. Komp.	aktywne
bcc497f2-f759-4ec3-8620-a0ed8b4fc5d9	EiAs2	2026-04-15	16:15:00	90	Język francuski	mgr B. Heil	139SJO	Lek	Lektorat	aktywne
0669034b-5972-4aeb-bde4-d6acb60b2fbb	EiAs2	2026-04-15	17:00:00	90	Podstawy elektroniki	mgr inż. M. Raźny	06	L8	Laboratoria	aktywne
19fdd60a-d968-44ce-9a0b-709500e35873	EiAs2	2026-04-15	17:00:00	90	Programowanie w C++	dr inż. D. Gutenko	19	Lk3	Lab. Komp.	aktywne
7987830a-7d16-4e30-8fb1-06b0d7502f0e	EiAs2	2026-04-16	08:15:00	90	Programowanie w C++	dr inż. D. Gutenko	A3	W	Wykład	aktywne
513f7e2d-7b14-4994-b009-d5fcd5470eb1	EiAs2	2026-04-16	10:00:00	90	Geometria i grafika inżynierska w AUTOCAD	mgr inż. M. Gibas	13	Lk1	Lab. Komp.	aktywne
1b7b44f7-23bf-4577-be33-5f72708fb97f	EiAs2	2026-04-16	10:00:00	90	Podstawy elektroniki	dr inż. A. Drwal	06	L_dodatkowa	Laboratoria	aktywne
1a93187f-71dc-4cc0-b5af-e3f5a502c787	EiAs2	2026-04-16	11:45:00	90	Podstawy elektroniki	dr inż. A. Drwal	06	L9	Laboratoria	aktywne
d2771647-3f16-4630-a0e8-4c5ee6b775c6	EiAs2	2026-04-16	11:45:00	90	Geometria i grafika inżynierska w AUTOCAD	mgr inż. M. Gibas	13	Lk2	Lab. Komp.	aktywne
73f54ef6-8284-4196-bee4-cfa8176a595b	EiAs2	2026-04-16	13:30:00	90	Podstawy elektroniki	dr inż. S. Żaba	06	L1	Laboratoria	aktywne
b3acac7b-30ac-4fbb-9e2f-d9e052fd6a9d	EiAs2	2026-04-16	13:30:00	90	Geometria i grafika inżynierska w AUTOCAD	mgr inż. M. Gibas	13	Lk3	Lab. Komp.	aktywne
a7af7a27-8cbf-4ed6-b9f4-0226ae9cc635	EiAs2	2026-04-16	15:15:00	90	Podstawy elektroniki	dr inż. S. Żaba	06	L2	Laboratoria	aktywne
0fa0a43a-f640-4a8f-b73a-5c835af1ff77	EiAs2	2026-04-16	15:15:00	90	Geometria i grafika inżynierska w AUTOCAD	mgr inż. M. Gibas	13	Lk4	Lab. Komp.	aktywne
6c9d3bc2-da24-4f0c-90fd-e1ac9cefa7e4	EiAs2	2026-04-16	17:00:00	90	Podstawy elektroniki	dr inż. S. Żaba	06	L4	Laboratoria	aktywne
09150673-d9d7-48ad-b499-4dec63e602cf	EiAs2	2026-05-20	16:15:00	90	Język francuski	mgr B. Heil	139SJO	Lek	Lektorat	aktywne
5a2523cd-44cf-4ac9-80eb-491bc8cd1c6c	EiAs2	2026-04-16	17:00:00	90	Geometria i grafika inżynierska w AUTOCAD	mgr inż. M. Gibas	13	Lk5	Lab. Komp.	aktywne
ca0479be-cbe8-4fef-9351-f1ee83aeddd7	EiAs2	2026-04-16	17:00:00	90	Programowanie w C++	mgr inż. K. Kopera	101B	Lk4	Lab. Komp.	aktywne
26ac3ded-1c35-4bcc-9e54-e1a62a0d8d3f	EiAs2	2026-04-16	18:45:00	90	Podstawy elektroniki	dr inż. S. Żaba	06	L3	Laboratoria	aktywne
f4a22363-f9da-4d2f-a8c5-2e61f3e98ca9	EiAs2	2026-04-16	18:45:00	90	Geometria i grafika inżynierska w AUTOCAD	mgr inż. M. Gibas	13	P4	Projekt	aktywne
7536af0d-163d-494f-af05-85d4ac92d9a8	EiAs2	2026-04-16	18:45:00	90	Programowanie w C++	mgr inż. K. Kopera	101B	Lk5	Lab. Komp.	aktywne
e9080343-edf1-45a6-89d5-c182480df34b	EiAs2	2026-04-17	08:15:00	135	Fizyka	K. Suchanek (op), J. Kurzyk, W. Chajec	F115	L1 / L2 / L3	Laboratoria	aktywne
678c2f76-1040-4241-aaf1-5485282be0f1	EiAs2	2026-04-17	11:00:00	90	Fizyka	W. Chajec	F101	W	Wykład	aktywne
1a99c277-7351-4caf-8e76-40edef09e682	EiAs2	2026-04-17	12:45:00	45	Fizyka	W. Chajec	F203	Ć1	Ćwiczenia	aktywne
f4b06f17-8886-4406-896d-db8b6f75bd48	EiAs2	2026-04-17	12:45:00	45	Fizyka	E. Borsuk	F204	Ć3	Ćwiczenia	aktywne
0ece31dc-3256-4f01-a222-b22aacf28edd	EiAs2	2026-04-17	12:45:00	45	Fizyka	B. Burtan-Gwizdała,	F112	Ć2	Ćwiczenia	aktywne
4ec7ce50-00c9-4fc8-94f2-37d8c831148c	EiAs2	2026-04-20	07:30:00	135	Analiza matematyczna	dr A. Pudełko	A2	W	Wykład	aktywne
68a131cb-0e3f-4f33-983a-484479c58335	EiAs2	2026-04-20	10:00:00	90	Analiza matematyczna	dr A. Pudełko	A2	Ć2	Ćwiczenia	aktywne
d9966bd9-0dcf-4da6-902b-9eee56cf1a6d	EiAs2	2026-04-20	10:00:00	90	Język angielski	mgr J. Firganek	136SJO	Lek5	Lektorat	aktywne
b8a89947-de0b-4cf4-a0d9-6d1dead58bce	EiAs2	2026-04-20	10:00:00	90	Język angielski	mgr A. Zwierzyńska-Dubis	139SJO	Lek1	Lektorat	aktywne
f5159d6c-55ff-47fc-b67c-d0a86d60a472	EiAs2	2026-04-20	11:45:00	90	Analiza matematyczna	mgr M. Ból	A2	Ć1	Ćwiczenia	aktywne
65278b73-7a58-4689-98b0-95ec2801c83c	EiAs2	2026-04-20	11:45:00	90	Język angielski	mgr J. Firganek	136SJO	Lek3	Lektorat	aktywne
c5bc284e-564f-4d81-9536-be6fedccde06	EiAs2	2026-04-20	11:45:00	90	Język niemiecki	mgr E. Targosz	139SJO	Lek	Lektorat	aktywne
957a3ed8-531e-4ac4-8ac4-24bfe6a55fe9	EiAs2	2026-04-20	13:30:00	90	Analiza matematyczna	dr J. Czajkowski	A2	Ć3	Ćwiczenia	aktywne
b7decb82-cbfa-40eb-b9bd-82dfef1631f8	EiAs2	2026-04-20	13:30:00	90	Język angielski	mgr J. Firganek	136SJO	Lek2	Lektorat	aktywne
b538359c-7104-447b-be7b-da7941d089c2	EiAs2	2026-04-20	13:30:00	90	Programowanie w C++	mgr inż. M. Raźny	19	P1	Projekt	aktywne
9580fab2-317a-4e8f-b8de-36bf63ba0480	EiAs2	2026-04-20	15:15:00	90	Programowanie w C++	mgr inż. M. Raźny	19	P5	Projekt	aktywne
9040d2b8-9d30-4c69-8a43-5371904376a7	EiAs2	2026-04-20	17:00:00	90	Programowanie w C++	mgr inż. M. Raźny	19	P3	Projekt	aktywne
98aa304a-5e60-43d8-92e5-e04354c88b56	EiAs2	2026-04-20	17:00:00	90	Geometria i grafika inżynierska w AUTOCAD	prof. P. Małka	18	P5	Projekt	aktywne
11f5c6c9-cb31-4690-86d1-0ffa9fd29494	EiAs2	2026-04-21	07:30:00	90	Geometria i grafika inżynierska w AUTOCAD	prof. P. Małka	12	P2	Projekt	aktywne
1cc4ae3f-bed2-4f8c-91af-98f9e9bf42c9	EiAs2	2026-04-21	09:15:00	90	Podstawy elektroniki	prof. A. Szromba	A4	W	Wykład	aktywne
527273a3-85a0-432c-b6df-3936be4f62bf	EiAs2	2026-04-21	11:00:00	90	Język angielski	mgr A. Zwierzyńska-Dubis	150SJO	Lek4	Lektorat	aktywne
f45af621-4da8-4a40-ac4f-7aabc1f63caa	EiAs2	2026-04-21	11:00:00	90	Podstawy elektroniki	prof. A. Szromba	A4	Ć2	Ćwiczenia	aktywne
ddd1ecfb-79bf-47a4-83fe-0aa183af1d48	EiAs2	2026-04-21	12:45:00	90	Metody numeryczne	dr inż. G. Pędrak	A3	W	Wykład	aktywne
cd2b933c-0303-4a88-963e-e81e73504f26	EiAs2	2026-04-21	14:30:00	90	Geometria i grafika inżynierska w AUTOCAD	dr inż. Z. Pilch	A4	W	Wykład	aktywne
a97581eb-2b25-49b3-859d-8359721c3b6e	EiAs2	2026-04-21	16:15:00	90	Geometria i grafika inżynierska w AUTOCAD	prof. P. Małka	13	Lk6	Lab. Komp.	aktywne
14e24021-0764-4cd9-b7c5-441524cf72d3	EiAs2	2026-04-21	18:00:00	90	Programowanie w C++	dr inż. D. Gutenko	19	Lk6	Lab. Komp.	aktywne
c0f4f66e-515a-4e8c-8d73-fb9176bd1358	EiAs2	2026-04-21	19:45:00	90	Geometria i grafika inżynierska w AUTOCAD	prof. P. Małka	13	P6	Projekt	aktywne
9e6f4cf0-688d-4f51-826a-9f97c50348c1	EiAs2	2026-04-22	11:45:00	90	Podstawy elektroniki	mgr inż. M. Raźny	06	L5	Laboratoria	aktywne
4294fd0f-82ac-43bf-9a0e-5f868eef14bd	EiAs2	2026-04-22	11:45:00	90	Podstawy elektroniki	prof. A. Szromba	10	Ć3	Ćwiczenia	aktywne
a288b3aa-1917-41f8-9798-720526e47f7f	EiAs2	2026-04-22	11:45:00	90	Metody numeryczne	dr inż. G. Pędrak	202	Lk1	Lab. Komp.	aktywne
df34462d-9c37-4798-b20c-ba10d13bb0b8	EiAs2	2026-04-22	13:30:00	90	Podstawy elektroniki	mgr inż. M. Raźny	06	L6	Laboratoria	aktywne
4a699e9d-f38f-4bf9-b7e9-23510f3dbedd	EiAs2	2026-04-22	13:30:00	90	Metody numeryczne	dr inż. M. Orkisz	202	Lk3	Lab. Komp.	aktywne
b1a207f4-6a84-4812-9af8-8d841c080c50	EiAs2	2026-04-22	13:30:00	90	Programowanie w C++	dr inż. D. Gutenko	19	Lk1	Lab. Komp.	aktywne
13bcafcc-eddf-48b1-b0b2-7a9da42352a2	EiAs2	2026-04-22	15:15:00	90	Podstawy elektroniki	mgr inż. M. Raźny	06	L7	Laboratoria	aktywne
1b2b2f0c-0d33-4708-bf1e-f1bc178593b0	EiAs2	2026-04-22	15:15:00	90	Metody numeryczne	dr inż. M. Orkisz	202	Lk4	Lab. Komp.	aktywne
8469eb08-ff1a-429d-b8e1-7f33e851e736	EiAs2	2026-04-22	15:15:00	90	Programowanie w C++	dr inż. D. Gutenko	19	Lk2	Lab. Komp.	aktywne
2080aa7e-4e7d-4beb-b2b0-39083227f3d7	EiAs2	2026-04-22	16:15:00	90	Język francuski	mgr B. Heil	139SJO	Lek	Lektorat	aktywne
210c22b6-1961-4ce2-baab-cc857e49570a	EiAs2	2026-04-22	17:00:00	90	Podstawy elektroniki	mgr inż. M. Raźny	06	L8	Laboratoria	aktywne
cac64f28-784c-46a5-8dc3-262ed80e5139	EiAs2	2026-04-22	17:00:00	90	Programowanie w C++	dr inż. D. Gutenko	19	Lk3	Lab. Komp.	aktywne
1415a0ad-ce48-4b32-a365-f324037b5912	EiAs2	2026-04-23	08:15:00	90	Programowanie w C++	dr inż. D. Gutenko	A3	W	Wykład	aktywne
7fff3a9d-4cd8-4139-a5c8-b57aa841cfc5	EiAs2	2026-04-23	10:00:00	90	Geometria i grafika inżynierska w AUTOCAD	mgr inż. M. Gibas	13	Lk1	Lab. Komp.	aktywne
b236780f-63ae-4a6f-ad03-1bcdc36dabe5	EiAs2	2026-04-23	10:00:00	90	Podstawy elektroniki	dr inż. A. Drwal	06	L_dodatkowa	Laboratoria	aktywne
3876d746-9045-452b-a718-c69a76236b6c	EiAs2	2026-04-23	11:45:00	90	Podstawy elektroniki	dr inż. A. Drwal	06	L9	Laboratoria	aktywne
1069f549-f6e6-4ede-b8c8-4fd991075eb9	EiAs2	2026-04-23	11:45:00	90	Geometria i grafika inżynierska w AUTOCAD	mgr inż. M. Gibas	13	Lk2	Lab. Komp.	aktywne
f3f5abc7-e0ac-4e0e-b965-10ce6333bbe3	EiAs2	2026-04-23	13:30:00	90	Podstawy elektroniki	dr inż. S. Żaba	06	L1	Laboratoria	aktywne
10b61b03-dd57-494f-af9a-15b1da6674c4	EiAs2	2026-04-23	13:30:00	90	Geometria i grafika inżynierska w AUTOCAD	mgr inż. M. Gibas	13	Lk3	Lab. Komp.	aktywne
18b3dccf-2154-4e42-9288-cb016048d50c	EiAs2	2026-04-23	15:15:00	90	Podstawy elektroniki	dr inż. S. Żaba	06	L2	Laboratoria	aktywne
c8033043-0c79-430c-8f7c-43030a096def	EiAs2	2026-04-23	15:15:00	90	Geometria i grafika inżynierska w AUTOCAD	mgr inż. M. Gibas	13	Lk4	Lab. Komp.	aktywne
4d18265d-eea0-4ca1-befa-a5da2f64fdef	EiAs2	2026-04-23	17:00:00	90	Podstawy elektroniki	dr inż. S. Żaba	06	L4	Laboratoria	aktywne
4498b9dd-d36a-4277-a52d-baf156df236b	EiAs2	2026-04-23	17:00:00	90	Geometria i grafika inżynierska w AUTOCAD	mgr inż. M. Gibas	13	Lk5	Lab. Komp.	aktywne
672b6f5d-6999-4f25-86a2-4519bc072ac4	EiAs2	2026-04-23	17:00:00	90	Programowanie w C++	mgr inż. K. Kopera	101B	Lk4	Lab. Komp.	aktywne
20113f11-eb88-41b6-8621-7fc855a8180c	EiAs2	2026-04-23	18:45:00	90	Podstawy elektroniki	dr inż. S. Żaba	06	L3	Laboratoria	aktywne
cd2ebffe-e0fb-4b25-b5e5-1b23b9573e07	EiAs2	2026-04-23	18:45:00	90	Geometria i grafika inżynierska w AUTOCAD	mgr inż. M. Gibas	13	P3	Projekt	aktywne
c0167a6a-00b0-46ac-b9b5-d0b9418a473b	EiAs2	2026-04-23	18:45:00	90	Programowanie w C++	mgr inż. K. Kopera	101B	Lk5	Lab. Komp.	aktywne
7f7d17ac-769a-4d4a-95c3-e58fb00dec67	EiAs2	2026-04-24	08:15:00	135	Fizyka	K. Suchanek (op), J. Kurzyk, W. Chajec	F115	L4 / L5 / L6	Laboratoria	aktywne
8d156244-8fd0-4274-a080-2b81a050fe8c	EiAs2	2026-04-24	11:00:00	90	Fizyka	W. Chajec	F101	W	Wykład	aktywne
448b17e4-c756-41d2-b6b4-d2e261b11ce9	EiAs2	2026-04-24	12:45:00	45	Fizyka	W. Chajec	F203	Ć1	Ćwiczenia	aktywne
14fd34f9-a43f-480e-acc7-0e6bebab7aa1	EiAs2	2026-04-24	12:45:00	45	Fizyka	E. Borsuk	F204	Ć3	Ćwiczenia	aktywne
74c1fbdf-7561-429f-a827-7cdb138d5edd	EiAs2	2026-04-24	12:45:00	45	Fizyka	B. Burtan-Gwizdała,	F112	Ć2	Ćwiczenia	aktywne
3f04ca21-ee68-4541-b45d-05ea74e440bd	EiAs2	2026-04-24	13:45:00	135	Fizyka	B. Burtan-Gwizdała (op), M. Duras, E. Borsuk	F115	L7 / L8 / L9	Laboratoria	aktywne
9b0b3748-8860-45d4-b5ff-44bf295941dd	EiAs2	2026-04-27	07:30:00	135	Analiza matematyczna	dr A. Pudełko	A2	W	Wykład	aktywne
e587bdbe-25c4-48a3-b0dc-9934f2e8f21e	EiAs2	2026-04-27	10:00:00	90	Analiza matematyczna	dr A. Pudełko	A2	Ć2	Ćwiczenia	aktywne
7ebc174e-409d-495c-a4ce-02ae5de28452	EiAs2	2026-04-27	10:00:00	90	Język angielski	mgr J. Firganek	136SJO	Lek5	Lektorat	aktywne
fba92b83-40c2-4ab1-9874-4116bbabd1d8	EiAs2	2026-04-27	10:00:00	90	Język angielski	mgr A. Zwierzyńska-Dubis	139SJO	Lek1	Lektorat	aktywne
368888be-e942-4861-a11e-fbe3993576f5	EiAs2	2026-04-27	11:45:00	90	Analiza matematyczna	mgr M. Ból	A2	Ć1	Ćwiczenia	aktywne
2cfd3d73-96d4-413a-8d14-d99902a48784	EiAs2	2026-04-27	11:45:00	90	Język angielski	mgr J. Firganek	136SJO	Lek3	Lektorat	aktywne
d535f9fc-43a4-4fbd-ab01-91872b84baab	EiAs2	2026-04-27	11:45:00	90	Język niemiecki	mgr E. Targosz	139SJO	Lek	Lektorat	aktywne
ae260d5e-75ec-4284-9afa-948da5fe15dc	EiAs2	2026-04-27	13:30:00	90	Analiza matematyczna	dr J. Czajkowski	A2	Ć3	Ćwiczenia	aktywne
3ebe92b2-3a22-491f-8b2f-5c4be350224c	EiAs2	2026-04-27	13:30:00	90	Język angielski	mgr J. Firganek	136SJO	Lek2	Lektorat	aktywne
fc783c72-c27f-4204-85c4-6ca35ef4fd0f	EiAs2	2026-04-27	13:30:00	90	Programowanie w C++	mgr inż. M. Raźny	19	P4	Projekt	aktywne
4924e96d-0afd-4ab7-9de6-1adbdd846929	EiAs2	2026-04-27	15:15:00	90	Programowanie w C++	mgr inż. M. Raźny	19	P2	Projekt	aktywne
06f1ee10-ee13-4ae4-a978-56d5eab719cc	EiAs2	2026-04-27	17:00:00	90	Geometria i grafika inżynierska w AUTOCAD	prof. P. Małka	18	P1	Projekt	aktywne
0b28976c-ee59-421b-8804-600b73943a9b	EiAs2	2026-04-28	09:15:00	90	Podstawy elektroniki	prof. A. Szromba	A4	W	Wykład	aktywne
0845ed86-0a72-4854-aab5-cd6e9c94fe34	EiAs2	2026-04-28	11:00:00	90	Język angielski	mgr A. Zwierzyńska-Dubis	150SJO	Lek4	Lektorat	aktywne
1c5bcd6b-e7b3-445c-8c40-91d33dfc78cb	EiAs2	2026-04-28	11:00:00	90	Podstawy elektroniki	prof. A. Szromba	A4	Ć1	Ćwiczenia	aktywne
fc90d740-b0e1-4ff8-bed8-868554791e7d	EiAs2	2026-04-28	12:45:00	90	Programowanie w C++	dr inż. D. Gutenko	101B	P6	Projekt	aktywne
6a6ad72e-4efc-4cd3-b983-1b08f369342d	EiAs2	2026-04-28	16:15:00	90	Geometria i grafika inżynierska w AUTOCAD	prof. P. Małka	13	Lk6	Lab. Komp.	aktywne
f45087e0-81fc-454f-a860-ea64fc89ecc2	EiAs2	2026-04-28	18:00:00	90	Programowanie w C++	dr inż. D. Gutenko	19	Lk6	Lab. Komp.	aktywne
0203e4a6-c412-4fbe-9fcc-ae993f1a7c6e	EiAs2	2026-04-29	11:45:00	90	Podstawy elektroniki	mgr inż. M. Raźny	06	L5	Laboratoria	aktywne
3b4a52ca-0260-4562-ad4c-bdf03907e5c8	EiAs2	2026-04-29	11:45:00	90	Metody numeryczne	dr inż. G. Pędrak	202	Lk2	Lab. Komp.	aktywne
07fe76e6-974a-408f-8749-a19d164aaa47	EiAs2	2026-04-29	11:45:00	90	Podstawy elektroniki	prof. A. Szromba	10	C_dodatkowa	Ćwiczenia	aktywne
8cf9507a-f8ca-47f4-a9f8-00cd6f01dde0	EiAs2	2026-04-29	13:30:00	90	Podstawy elektroniki	mgr inż. M. Raźny	06	L6	Laboratoria	aktywne
32af4741-81bd-4913-8111-55ead507973b	EiAs2	2026-04-29	13:30:00	90	Metody numeryczne	dr inż. M. Orkisz	202	Lk5	Lab. Komp.	aktywne
596b9a9a-7021-4574-a875-86759d672b92	EiAs2	2026-04-29	13:30:00	90	Programowanie w C++	dr inż. D. Gutenko	19	Lk1	Lab. Komp.	aktywne
74d940a6-2dd5-4a77-b7cf-1d6bb53fce6f	EiAs2	2026-04-29	15:15:00	90	Podstawy elektroniki	mgr inż. M. Raźny	06	L7	Laboratoria	aktywne
accb89cc-7d33-4051-8110-ed6a1116fc76	EiAs2	2026-04-29	15:15:00	90	Metody numeryczne	dr inż. M. Orkisz	202	Lk6	Lab. Komp.	aktywne
fae3c750-ebae-47a3-b024-6c15217bd661	EiAs2	2026-04-29	15:15:00	90	Programowanie w C++	dr inż. D. Gutenko	19	Lk2	Lab. Komp.	aktywne
34359dd6-7fa7-4cef-a1a9-c4e253eba01c	EiAs2	2026-04-29	16:15:00	90	Język francuski	mgr B. Heil	139SJO	Lek	Lektorat	aktywne
47015e01-dc5e-4395-8236-c18fa1bc2a87	EiAs2	2026-04-29	17:00:00	90	Podstawy elektroniki	mgr inż. M. Raźny	06	L8	Laboratoria	aktywne
ee100815-3ad9-4976-abdd-22c15e7ca9be	EiAs2	2026-04-29	17:00:00	90	Programowanie w C++	dr inż. D. Gutenko	19	Lk3	Lab. Komp.	aktywne
4f684fc2-0e80-4ea1-819f-e304bb450b29	EiAs2	2026-04-30	08:15:00	90	Programowanie w C++	dr inż. D. Gutenko	A3	W	Wykład	aktywne
4ff75868-34a9-4195-9161-01cc3a440d28	EiAs2	2026-04-30	10:00:00	90	Geometria i grafika inżynierska w AUTOCAD	mgr inż. M. Gibas	13	Lk1	Lab. Komp.	aktywne
04470296-8cc7-4fed-b28f-63adec1c38ad	EiAs2	2026-04-30	10:00:00	90	Podstawy elektroniki	dr inż. A. Drwal	06	L_dodatkowa	Laboratoria	aktywne
be9de1eb-3509-4b58-8223-a9bfe33c8bc2	EiAs2	2026-04-30	11:45:00	90	Podstawy elektroniki	dr inż. A. Drwal	06	L9	Laboratoria	aktywne
02389465-3b62-4e8a-8988-d9471a937521	EiAs2	2026-04-30	11:45:00	90	Geometria i grafika inżynierska w AUTOCAD	mgr inż. M. Gibas	13	Lk2	Lab. Komp.	aktywne
4938a6e1-b2ff-4cdd-aa1c-812d84faf6d1	EiAs2	2026-04-30	13:30:00	90	Podstawy elektroniki	dr inż. S. Żaba	06	L1	Laboratoria	aktywne
87233c60-fa96-440a-80dd-eebd4024f31c	EiAs2	2026-04-30	13:30:00	90	Geometria i grafika inżynierska w AUTOCAD	mgr inż. M. Gibas	13	Lk3	Lab. Komp.	aktywne
42eb07c5-c1c3-4beb-aa42-eb56fd07c71b	EiAs2	2026-04-30	15:15:00	90	Podstawy elektroniki	dr inż. S. Żaba	06	L2	Laboratoria	aktywne
82c7d247-3ebd-40b6-80ba-7a7828855e17	EiAs2	2026-04-30	15:15:00	90	Geometria i grafika inżynierska w AUTOCAD	mgr inż. M. Gibas	13	Lk4	Lab. Komp.	aktywne
cd600085-1847-4b2f-9206-6d0138c71174	EiAs2	2026-04-30	17:00:00	90	Podstawy elektroniki	dr inż. S. Żaba	06	L4	Laboratoria	aktywne
172d9062-4a14-4be1-9146-dc5f161aee8b	EiAs2	2026-04-30	17:00:00	90	Geometria i grafika inżynierska w AUTOCAD	mgr inż. M. Gibas	13	Lk5	Lab. Komp.	aktywne
d0b5097a-759d-42bf-92b7-84a714ab553b	EiAs2	2026-04-30	17:00:00	90	Programowanie w C++	mgr inż. K. Kopera	101B	Lk4	Lab. Komp.	aktywne
0fd9e1fd-39f0-44ac-869f-079ff1fb9613	EiAs2	2026-04-30	18:45:00	90	Podstawy elektroniki	dr inż. S. Żaba	06	L3	Laboratoria	aktywne
fc3659b2-75b7-4005-9003-f9558e7b5ab6	EiAs2	2026-04-30	18:45:00	90	Geometria i grafika inżynierska w AUTOCAD	mgr inż. M. Gibas	13	P4	Projekt	aktywne
544d8ad1-4e65-4a8e-88c2-a1a02d3ac5e4	EiAs2	2026-04-30	18:45:00	90	Programowanie w C++	mgr inż. K. Kopera	101B	Lk5	Lab. Komp.	aktywne
43681d60-4fd5-4690-94ba-2ea0ea03064e	EiAs2	2026-05-01	07:00:00	900	Majówka	Brak	-	Wszystkie grupy	święto	wolne
20fd233a-d632-424b-a507-42efdfe7fc1f	EiAs2	2026-05-02	07:00:00	900	Majówka	Brak	-	Wszystkie grupy	święto	wolne
37289a2c-7c36-46dd-920b-4471f9f73020	EiAs2	2026-05-05	07:30:00	90	Geometria i grafika inżynierska w AUTOCAD	prof. P. Małka	12	P2	Projekt	aktywne
fe97c359-4402-46c5-81cb-a4ee8359adb9	EiAs2	2026-05-05	09:15:00	90	Podstawy elektroniki	prof. A. Szromba	A4	W	Wykład	aktywne
5ec8c39c-d730-4a44-a02e-76494b02ac8a	EiAs2	2026-05-05	11:00:00	90	Język angielski	mgr A. Zwierzyńska-Dubis	150SJO	Lek4	Lektorat	aktywne
4d4af976-8fc3-4840-95eb-1469bfef2e10	EiAs2	2026-05-05	11:00:00	90	Podstawy elektroniki	prof. A. Szromba	A4	Ć2	Ćwiczenia	aktywne
95433172-f8e3-4f39-ab03-e3ab1ee75f75	EiAs2	2026-05-05	12:45:00	90	Metody numeryczne	dr inż. G. Pędrak	A3	W	Wykład	aktywne
538c6194-ea6e-4e26-a531-0c764af6f904	EiAs2	2026-05-05	14:30:00	90	Geometria i grafika inżynierska w AUTOCAD	dr inż. Z. Pilch	A4	W	Wykład	aktywne
3bbb6569-eb76-4062-b0a9-4c2c26ac2206	EiAs2	2026-05-05	16:15:00	90	Geometria i grafika inżynierska w AUTOCAD	prof. P. Małka	13	Lk6	Lab. Komp.	aktywne
e749fdc7-d42b-424e-8d54-e6dfc50cd15e	EiAs2	2026-05-05	18:00:00	90	Programowanie w C++	dr inż. D. Gutenko	19	Lk6	Lab. Komp.	aktywne
e0fbd0f0-52b7-4f14-a862-4d0a7a34894e	EiAs2	2026-05-05	19:45:00	90	Geometria i grafika inżynierska w AUTOCAD	prof. P. Małka	13	P6	Projekt	aktywne
5f385e4c-928d-41f0-a241-fb1a070ba71c	EiAs2	2026-05-06	11:45:00	90	Podstawy elektroniki	mgr inż. M. Raźny	06	L5	Laboratoria	aktywne
622a9be4-8e8a-4a3a-8dc4-9ddc6df30e97	EiAs2	2026-05-06	11:45:00	90	Podstawy elektroniki	prof. A. Szromba	10	Ć3	Ćwiczenia	aktywne
de4ecc0c-08f2-4d18-89fc-550f7e2f663e	EiAs2	2026-05-06	11:45:00	90	Metody numeryczne	dr inż. G. Pędrak	202	Lk1	Lab. Komp.	aktywne
23969152-277e-4c27-b4bb-833f7c5f2b34	EiAs2	2026-05-06	13:30:00	90	Podstawy elektroniki	mgr inż. M. Raźny	06	L6	Laboratoria	aktywne
94b42193-457e-4268-a271-2c6516f8c061	EiAs2	2026-05-06	13:30:00	90	Metody numeryczne	dr inż. M. Orkisz	202	Lk3	Lab. Komp.	aktywne
c54b8d2d-6c68-40b6-bb10-70d32ce62edb	EiAs2	2026-05-06	13:30:00	90	Programowanie w C++	dr inż. D. Gutenko	19	Lk1	Lab. Komp.	aktywne
a22d7e83-2918-40b3-9900-a11c66888aea	EiAs2	2026-05-06	15:15:00	90	Podstawy elektroniki	mgr inż. M. Raźny	06	L7	Laboratoria	aktywne
7c79c47d-bac6-438e-a203-20b6b29ae437	EiAs2	2026-05-06	15:15:00	90	Metody numeryczne	dr inż. M. Orkisz	202	Lk4	Lab. Komp.	aktywne
db93ca3e-2a96-495b-81af-0ced6763d2e7	EiAs2	2026-05-06	15:15:00	90	Programowanie w C++	dr inż. D. Gutenko	19	Lk2	Lab. Komp.	aktywne
aa348c01-7dfd-48ef-a14d-16beef32332e	EiAs2	2026-05-06	16:15:00	90	Język francuski	mgr B. Heil	139SJO	Lek	Lektorat	aktywne
427f3f8a-9ff1-47c9-b266-838acc739949	EiAs2	2026-05-06	17:00:00	90	Podstawy elektroniki	mgr inż. M. Raźny	06	L8	Laboratoria	aktywne
1c48ad5b-0970-40c4-9fba-f8c0da3024e9	EiAs2	2026-05-06	17:00:00	90	Programowanie w C++	dr inż. D. Gutenko	19	Lk3	Lab. Komp.	aktywne
ed321778-9ee5-4839-81e1-f6ee9ba1f333	EiAs2	2026-05-07	08:15:00	90	Programowanie w C++	dr inż. D. Gutenko	A3	W	Wykład	aktywne
4fc142cf-2420-4aee-9dbe-e6ff1fbf2777	EiAs2	2026-05-07	10:00:00	90	Geometria i grafika inżynierska w AUTOCAD	mgr inż. M. Gibas	13	Lk1	Lab. Komp.	aktywne
2024139b-73f5-4b9e-ac7b-7654a5c105ef	EiAs2	2026-05-07	10:00:00	90	Podstawy elektroniki	dr inż. A. Drwal	06	L_dodatkowa	Laboratoria	aktywne
28b2c897-4d82-4a12-b67d-be93437c3496	EiAs2	2026-05-07	11:45:00	90	Podstawy elektroniki	dr inż. A. Drwal	06	L9	Laboratoria	aktywne
c9341810-f783-4b77-b4d7-b5855d8a5d88	EiAs2	2026-05-07	11:45:00	90	Geometria i grafika inżynierska w AUTOCAD	mgr inż. M. Gibas	13	Lk2	Lab. Komp.	aktywne
c54e4d43-22be-4a1b-951b-f0e794933ea0	EiAs2	2026-05-07	13:30:00	90	Podstawy elektroniki	dr inż. S. Żaba	06	L1	Laboratoria	aktywne
0803f93c-7e54-4f5a-be2d-1d5959d2ed90	EiAs2	2026-05-07	13:30:00	90	Geometria i grafika inżynierska w AUTOCAD	mgr inż. M. Gibas	13	Lk3	Lab. Komp.	aktywne
185f6fac-95e2-4a9b-be29-c1684894c8fa	EiAs2	2026-05-07	15:15:00	90	Podstawy elektroniki	dr inż. S. Żaba	06	L2	Laboratoria	aktywne
5b20ffaf-18ee-4cbb-8331-21fa5a599275	EiAs2	2026-05-07	15:15:00	90	Geometria i grafika inżynierska w AUTOCAD	mgr inż. M. Gibas	13	Lk4	Lab. Komp.	aktywne
7433e57e-b54c-4fd8-ae86-d270a69c8c4d	EiAs2	2026-05-07	17:00:00	90	Podstawy elektroniki	dr inż. S. Żaba	06	L4	Laboratoria	aktywne
235b407b-b24a-4b87-97a0-97d902e9bea7	EiAs2	2026-05-07	17:00:00	90	Geometria i grafika inżynierska w AUTOCAD	mgr inż. M. Gibas	13	Lk5	Lab. Komp.	aktywne
00cf63cf-1cca-48e8-b413-b6bfda4dbcf9	EiAs2	2026-05-07	17:00:00	90	Programowanie w C++	mgr inż. K. Kopera	101B	Lk4	Lab. Komp.	aktywne
36ba46b4-9c0e-40d1-9191-36c2678586a6	EiAs2	2026-05-07	18:45:00	90	Podstawy elektroniki	dr inż. S. Żaba	06	L3	Laboratoria	aktywne
8c8a7513-0aed-44e4-a395-5661b2409664	EiAs2	2026-05-07	18:45:00	90	Geometria i grafika inżynierska w AUTOCAD	mgr inż. M. Gibas	13	P3	Projekt	aktywne
f4256354-050a-4caf-84d1-e745747f2eec	EiAs2	2026-05-07	18:45:00	90	Programowanie w C++	mgr inż. K. Kopera	101B	Lk5	Lab. Komp.	aktywne
18fd823c-29ac-480f-b47d-097e4cbd9919	EiAs2	2026-05-08	08:15:00	135	Fizyka	K. Suchanek (op), J. Kurzyk, W. Chajec	F115	L1 / L2 / L3	Laboratoria	aktywne
2415e790-b957-4d3e-a89c-0c3ec0452abb	EiAs2	2026-05-08	11:00:00	90	Fizyka	W. Chajec	F101	W	Wykład	aktywne
ca542ea2-0c49-4328-bf19-4cc2c5ac9442	EiAs2	2026-05-08	12:45:00	45	Fizyka	W. Chajec	F203	Ć1	Ćwiczenia	aktywne
d5bfc886-9c38-47a9-ba64-2457c1b0a673	EiAs2	2026-05-08	12:45:00	45	Fizyka	E. Borsuk	F204	Ć3	Ćwiczenia	aktywne
744bd69a-ac4b-42d4-ba02-d6c75f5d80fe	EiAs2	2026-05-08	12:45:00	45	Fizyka	B. Burtan-Gwizdała,	F112	Ć2	Ćwiczenia	aktywne
0f741956-7add-48fe-a08f-1dd92cb0e5de	EiAs2	2026-05-08	13:45:00	135	Fizyka	B. Burtan-Gwizdała (op), M. Duras, E. Borsuk	F115	L7 / L8 / L9	Laboratoria	aktywne
1174786d-9ca7-46ec-81ff-c4f1a4122d5e	EiAs2	2026-05-11	07:30:00	135	Analiza matematyczna	dr A. Pudełko	A2	W	Wykład	aktywne
b1e1a6e0-e092-4df2-bd79-8027f6f1842c	EiAs2	2026-05-11	10:00:00	90	Analiza matematyczna	dr A. Pudełko	A2	Ć2	Ćwiczenia	aktywne
5a9968db-bc28-48be-90a7-ae6ffb102a2a	EiAs2	2026-05-11	10:00:00	90	Język angielski	mgr J. Firganek	136SJO	Lek5	Lektorat	aktywne
6e71a55d-9ed5-4b09-856a-8f512a420527	EiAs2	2026-05-11	10:00:00	90	Język angielski	mgr A. Zwierzyńska-Dubis	139SJO	Lek1	Lektorat	aktywne
81f9c842-b4b2-442e-af94-4072d7e9d362	EiAs2	2026-05-11	11:45:00	90	Analiza matematyczna	mgr M. Ból	A2	Ć1	Ćwiczenia	aktywne
43ca4a38-b158-4119-a7f2-8084957836a4	EiAs2	2026-05-11	11:45:00	90	Język angielski	mgr J. Firganek	136SJO	Lek3	Lektorat	aktywne
73351a1a-abc6-4f0d-868f-92700d67ff62	EiAs2	2026-05-11	11:45:00	90	Język niemiecki	mgr E. Targosz	139SJO	Lek	Lektorat	aktywne
e5cec752-fefb-496a-b70a-f36981dd2ebc	EiAs2	2026-05-11	13:30:00	90	Analiza matematyczna	dr J. Czajkowski	A2	Ć3	Ćwiczenia	aktywne
5d23366f-35ca-4fb5-9e1c-9f4b49e1d1d1	EiAs2	2026-05-11	13:30:00	90	Język angielski	mgr J. Firganek	136SJO	Lek2	Lektorat	aktywne
381d6106-5af6-463c-bccb-33be8b82df15	EiAs2	2026-05-11	13:30:00	90	Programowanie w C++	mgr inż. M. Raźny	19	P4	Projekt	aktywne
995b485d-86d9-4be2-bb2c-1cf27fd02738	EiAs2	2026-05-11	15:15:00	90	Programowanie w C++	mgr inż. M. Raźny	19	P2	Projekt	aktywne
09dbf425-2348-4bfd-9700-97ecab18bedc	EiAs2	2026-05-11	17:00:00	90	Geometria i grafika inżynierska w AUTOCAD	prof. P. Małka	18	P1	Projekt	aktywne
8cf31c19-8f05-4590-b525-9fa29efa7b16	EiAs2	2026-05-12	07:00:00	900	Święto Szkoły	Brak	-	Wszystkie grupy	święto	wolne
0027c4b4-d89d-47ff-88a5-843d5eec4872	EiAs2	2026-05-13	11:45:00	90	Podstawy elektroniki	mgr inż. M. Raźny	06	L5	Laboratoria	aktywne
bc5a41fd-d499-4966-9a95-1662b9e5f6fd	EiAs2	2026-05-13	11:45:00	90	Metody numeryczne	dr inż. G. Pędrak	202	Lk2	Lab. Komp.	aktywne
09abf2b8-f69f-49c4-9c5d-4f04026389e6	EiAs2	2026-05-13	11:45:00	90	Podstawy elektroniki	prof. A. Szromba	10	C_dodatkowa	Ćwiczenia	aktywne
55de5481-ab9f-4ad1-ac94-1e7e488cb2b1	EiAs2	2026-05-13	13:30:00	90	Podstawy elektroniki	mgr inż. M. Raźny	06	L6	Laboratoria	aktywne
150eab33-c92f-429b-83e6-e8415aa62a3d	EiAs2	2026-05-13	13:30:00	90	Metody numeryczne	dr inż. M. Orkisz	202	Lk5	Lab. Komp.	aktywne
1c2049b0-b730-4ddb-b1d1-881891037045	EiAs2	2026-05-13	13:30:00	90	Programowanie w C++	dr inż. D. Gutenko	19	Lk1	Lab. Komp.	aktywne
3a1ed0a5-d324-4c82-b4a8-2dab6a8b8e3a	EiAs2	2026-05-13	15:15:00	90	Podstawy elektroniki	mgr inż. M. Raźny	06	L7	Laboratoria	aktywne
5737272b-67ac-4b66-9e60-d10954e56524	EiAs2	2026-05-13	15:15:00	90	Metody numeryczne	dr inż. M. Orkisz	202	Lk6	Lab. Komp.	aktywne
187cbdc5-96e2-470f-b1d1-3b3ab2dd46d6	EiAs2	2026-05-13	15:15:00	90	Programowanie w C++	dr inż. D. Gutenko	19	Lk2	Lab. Komp.	aktywne
e4817644-5b32-4667-b218-df81dd2bb5e4	EiAs2	2026-05-13	16:15:00	90	Język francuski	mgr B. Heil	139SJO	Lek	Lektorat	aktywne
38dd9677-76e8-4fb9-bb9a-9f6172b8cbbd	EiAs2	2026-05-13	17:00:00	90	Podstawy elektroniki	mgr inż. M. Raźny	06	L8	Laboratoria	aktywne
8175c53e-5c1c-4998-b856-c7ce3f040fc6	EiAs2	2026-05-13	17:00:00	90	Programowanie w C++	dr inż. D. Gutenko	19	Lk3	Lab. Komp.	aktywne
d2d4d8be-bca4-4cc3-ad07-dc8dcd083d61	EiAs2	2026-05-14	08:15:00	90	Programowanie w C++	dr inż. D. Gutenko	A3	W	Wykład	aktywne
706dd0ef-2258-4c22-8249-d8115265e7d6	EiAs2	2026-05-14	10:00:00	90	Podstawy elektroniki	dr inż. A. Drwal	06	L_dodatkowa	Laboratoria	aktywne
27462c8e-b472-4a8e-9d3e-265414860693	EiAs2	2026-05-14	11:45:00	90	Podstawy elektroniki	dr inż. A. Drwal	06	L9	Laboratoria	aktywne
113f888e-dd3a-45a8-8407-b877bf08c889	EiAs2	2026-05-14	13:30:00	90	Podstawy elektroniki	dr inż. S. Żaba	06	L1	Laboratoria	aktywne
1979f417-aa35-4412-b700-f5833955ea6e	EiAs2	2026-05-14	15:15:00	90	Podstawy elektroniki	dr inż. S. Żaba	06	L2	Laboratoria	aktywne
081cc16d-53f2-4b61-af3d-ea720efe0392	EiAs2	2026-05-14	17:00:00	90	Podstawy elektroniki	dr inż. S. Żaba	06	L4	Laboratoria	aktywne
fff188fa-e1e0-4481-a466-d8856dcbf062	EiAs2	2026-05-14	17:00:00	90	Programowanie w C++	mgr inż. K. Kopera	101B	Lk4	Lab. Komp.	aktywne
29721712-c53b-4f84-89ae-29b6ce8ca26b	EiAs2	2026-05-14	17:00:00	45	Geometria i grafika inżynierska w AUTOCAD	mgr inż. M. Gibas	13	P3	Projekt	aktywne
392884d6-8032-4e9a-af27-33ae3d467982	EiAs2	2026-05-14	18:45:00	90	Podstawy elektroniki	dr inż. S. Żaba	06	L3	Laboratoria	aktywne
f1cc3e9b-dc9e-4b5d-a86a-5171509f5927	EiAs2	2026-05-14	18:45:00	90	Geometria i grafika inżynierska w AUTOCAD	mgr inż. M. Gibas	13	P4	Projekt	aktywne
4973ac4f-122e-4a14-8c73-20ebc72e12a4	EiAs2	2026-05-14	18:45:00	90	Programowanie w C++	mgr inż. K. Kopera	101B	Lk5	Lab. Komp.	aktywne
c4f969ce-bb76-422e-a004-2b222b4efad6	EiAs2	2026-05-15	08:15:00	135	Fizyka	K. Suchanek (op), J. Kurzyk, W. Chajec	F115	L4 / L5 / L6	Laboratoria	aktywne
a7bfce94-044a-4c5f-9028-aeac818d63eb	EiAs2	2026-05-15	11:00:00	90	Fizyka	W. Chajec	F101	W	Wykład	aktywne
6270a7ac-9f97-407b-9143-84298c2ca79c	EiAs2	2026-05-15	12:45:00	45	Fizyka	W. Chajec	F203	Ć1	Ćwiczenia	aktywne
36b11081-53c1-49ec-b8a4-c5f876bb9605	EiAs2	2026-05-15	12:45:00	45	Fizyka	E. Borsuk	F204	Ć3	Ćwiczenia	aktywne
de029ee6-68f5-4bd1-87c1-99b30a37eb9f	EiAs2	2026-05-15	12:45:00	45	Fizyka	B. Burtan-Gwizdała,	F112	Ć2	Ćwiczenia	aktywne
57bcf20a-12ea-4851-a272-5fb7ecf0fb92	EiAs2	2026-05-18	07:30:00	135	Analiza matematyczna	dr A. Pudełko	A2	W	Wykład	aktywne
563e35b7-fa11-434b-b6fc-3ed0f33c3e26	EiAs2	2026-05-18	10:00:00	90	Analiza matematyczna	dr A. Pudełko	A2	Ć2	Ćwiczenia	aktywne
acbe0d44-7224-48bb-a4d2-5bff11b89470	EiAs2	2026-05-18	10:00:00	90	Język angielski	mgr J. Firganek	136SJO	Lek5	Lektorat	aktywne
9555f245-b26e-4ea9-ac7d-e75e492e187e	EiAs2	2026-05-18	10:00:00	90	Język angielski	mgr A. Zwierzyńska-Dubis	139SJO	Lek1	Lektorat	aktywne
a99ef301-8e28-40dd-b2b0-004862c6f898	EiAs2	2026-05-18	11:45:00	90	Analiza matematyczna	mgr M. Ból	A2	Ć1	Ćwiczenia	aktywne
961571b9-dc8f-4766-9c8f-5d0e7102d722	EiAs2	2026-05-18	11:45:00	90	Język angielski	mgr J. Firganek	136SJO	Lek3	Lektorat	aktywne
ce01fed0-dcad-4caa-be54-4ea8849ce722	EiAs2	2026-05-18	11:45:00	90	Język niemiecki	mgr E. Targosz	139SJO	Lek	Lektorat	aktywne
e4867c4f-6033-4c6c-ab6b-ce01996db476	EiAs2	2026-05-18	13:30:00	90	Analiza matematyczna	dr J. Czajkowski	A2	Ć3	Ćwiczenia	aktywne
dcb9e345-3a76-46b2-830f-d72e0b6dbcc1	EiAs2	2026-05-18	13:30:00	90	Język angielski	mgr J. Firganek	136SJO	Lek2	Lektorat	aktywne
81539bcb-03c6-4410-9cbb-a3010c185121	EiAs2	2026-05-18	13:30:00	90	Programowanie w C++	mgr inż. M. Raźny	19	P1	Projekt	aktywne
4f40b0bc-b24b-44d1-bdb2-7c92857eb246	EiAs2	2026-05-18	15:15:00	90	Programowanie w C++	mgr inż. M. Raźny	19	P5	Projekt	aktywne
2eb0480d-354c-40a4-8a53-49762938caf3	EiAs2	2026-05-18	17:00:00	90	Programowanie w C++	mgr inż. M. Raźny	19	P3	Projekt	aktywne
99098099-5268-4891-a445-acbc6673ee34	EiAs2	2026-05-18	17:00:00	90	Geometria i grafika inżynierska w AUTOCAD	prof. P. Małka	18	P5	Projekt	aktywne
62301cce-725a-4fd3-af6d-973bbd5e4410	EiAs2	2026-05-19	07:30:00	90	Geometria i grafika inżynierska w AUTOCAD	prof. P. Małka	12	P2	Projekt	aktywne
6370cc8f-40f1-4e57-aab9-076502083cc2	EiAs2	2026-05-19	09:15:00	90	Podstawy elektroniki	prof. A. Szromba	A4	W	Wykład	aktywne
1ff09ba2-a6f2-41b4-8e36-a35b8d3f5e5b	EiAs2	2026-05-19	11:00:00	90	Język angielski	mgr A. Zwierzyńska-Dubis	150SJO	Lek4	Lektorat	aktywne
45e1f4ac-68bf-4ba6-8236-6cbe0129ee4a	EiAs2	2026-05-19	11:00:00	90	Podstawy elektroniki	prof. A. Szromba	A4	Ć2	Ćwiczenia	aktywne
e5de6258-db9f-4d53-b841-edb61c91c3b4	EiAs2	2026-05-19	14:30:00	90	Geometria i grafika inżynierska w AUTOCAD	dr inż. Z. Pilch	A4	W	Wykład	aktywne
02b59c60-1421-4595-83db-deea260606fc	EiAs2	2026-05-19	18:00:00	90	Programowanie w C++	dr inż. D. Gutenko	19	Lk6	Lab. Komp.	aktywne
eda08c08-41da-4ffd-b0c0-94b767989a1d	EiAs2	2026-05-19	19:45:00	90	Geometria i grafika inżynierska w AUTOCAD	prof. P. Małka	13	P6	Projekt	aktywne
887b246d-576f-4192-9477-0fe75492382d	EiAs2	2026-05-20	11:45:00	90	Podstawy elektroniki	mgr inż. M. Raźny	06	L5	Laboratoria	aktywne
9acc8c66-b0a3-4416-b87e-4b03b1f7d833	EiAs2	2026-05-20	11:45:00	90	Podstawy elektroniki	prof. A. Szromba	10	Ć3	Ćwiczenia	aktywne
425a6842-4228-4dcc-a1b0-e574e71944cf	EiAs2	2026-05-20	11:45:00	90	Metody numeryczne	dr inż. G. Pędrak	202	Lk1	Lab. Komp.	aktywne
7ed10734-17cc-43a8-9b60-e626cca84961	EiAs2	2026-05-20	13:30:00	90	Podstawy elektroniki	mgr inż. M. Raźny	06	L6	Laboratoria	aktywne
1767c119-9278-4ba3-96b5-cf84769160bb	EiAs2	2026-05-20	13:30:00	90	Metody numeryczne	dr inż. M. Orkisz	202	Lk3	Lab. Komp.	aktywne
019dbd88-8558-4117-bd36-cdcf895dc0f2	EiAs2	2026-05-20	13:30:00	90	Programowanie w C++	dr inż. D. Gutenko	19	Lk1	Lab. Komp.	aktywne
a136d41a-4409-41b5-b3a7-00da2d3aed7b	EiAs2	2026-05-20	15:15:00	90	Podstawy elektroniki	mgr inż. M. Raźny	06	L7	Laboratoria	aktywne
a1cac380-d89e-464b-9237-c4eb065c3f68	EiAs2	2026-05-20	15:15:00	90	Metody numeryczne	dr inż. M. Orkisz	202	Lk4	Lab. Komp.	aktywne
eae15364-31a4-4e3c-8f21-44b6fd4b614e	EiAs2	2026-05-20	15:15:00	90	Programowanie w C++	dr inż. D. Gutenko	19	Lk2	Lab. Komp.	aktywne
5aa09b1d-d398-4312-8798-3795f0d4dfb1	EiAs2	2026-05-20	17:00:00	90	Podstawy elektroniki	mgr inż. M. Raźny	06	L8	Laboratoria	aktywne
1b6dbec7-cbf0-4e2f-bc1d-c9062d1faaa7	EiAs2	2026-05-20	17:00:00	90	Programowanie w C++	dr inż. D. Gutenko	19	Lk3	Lab. Komp.	aktywne
d58456ad-522d-4e63-b56e-c79ada7c2489	EiAs2	2026-05-21	08:15:00	90	Programowanie w C++	dr inż. D. Gutenko	A3	W	Wykład	aktywne
e20be68c-b4f9-4df2-b605-5e0bba67e2f1	EiAs2	2026-05-21	10:00:00	90	Podstawy elektroniki	dr inż. A. Drwal	06	L_dodatkowa	Laboratoria	aktywne
38bfe07b-698f-4dd1-ab2a-bd7df169b903	EiAs2	2026-05-21	11:45:00	90	Podstawy elektroniki	dr inż. A. Drwal	06	L9	Laboratoria	aktywne
4b32cfb2-0cb3-4fcb-989f-2fd59e28a4c4	EiAs2	2026-05-21	13:30:00	90	Podstawy elektroniki	dr inż. S. Żaba	06	L1	Laboratoria	aktywne
bc188cbd-4715-4a60-9749-b7b9583ad3d2	EiAs2	2026-05-21	15:15:00	90	Podstawy elektroniki	dr inż. S. Żaba	06	L2	Laboratoria	aktywne
bc0d6ccc-ba9c-4c57-9c3a-8119ac2a68e5	EiAs2	2026-05-21	17:00:00	90	Podstawy elektroniki	dr inż. S. Żaba	06	L4	Laboratoria	aktywne
90304f92-72ff-44a4-bbd7-67da937fb6bf	EiAs2	2026-05-21	17:00:00	90	Programowanie w C++	mgr inż. K. Kopera	101B	Lk4	Lab. Komp.	aktywne
7184685e-4715-4abf-9389-a71c266dd8d4	EiAs2	2026-05-21	18:45:00	90	Podstawy elektroniki	dr inż. S. Żaba	06	L3	Laboratoria	aktywne
6af03d31-ebf8-4614-934b-e8ad13921ff7	EiAs2	2026-05-21	18:45:00	90	Geometria i grafika inżynierska w AUTOCAD	mgr inż. M. Gibas	13	P3	Projekt	aktywne
707f99c7-ca1e-4b70-9867-d4ce4ee5ce38	EiAs2	2026-05-21	18:45:00	90	Programowanie w C++	mgr inż. K. Kopera	101B	Lk5	Lab. Komp.	aktywne
5015940b-1536-4989-9140-cc9f7b1582ba	EiAs2	2026-05-22	08:15:00	135	Fizyka	K. Suchanek (op), J. Kurzyk, W. Chajec	F115	L4 / L5 / L6	Laboratoria	aktywne
e01534eb-c09e-4833-b1a4-ac3ad484a279	EiAs2	2026-05-22	12:45:00	45	Fizyka	W. Chajec	F203	Ć1	Ćwiczenia	aktywne
96251e58-bd86-43ef-8d71-6453121d429b	EiAs2	2026-05-22	12:45:00	45	Fizyka	E. Borsuk	F204	Ć3	Ćwiczenia	aktywne
93b48793-1f3c-4622-950f-234aac186356	EiAs2	2026-05-22	12:45:00	45	Fizyka	B. Burtan-Gwizdała,	F112	Ć2	Ćwiczenia	aktywne
93403a2e-aa80-49a6-b732-b22019f01d47	EiAs2	2026-05-22	13:45:00	135	Fizyka	B. Burtan-Gwizdała (op), M. Duras, E. Borsuk	F115	L7 / L8 / L9	Laboratoria	aktywne
5b742350-e207-479e-885d-4b5964ea3c5b	EiAs2	2026-05-24	07:00:00	900	Zielone Świątki	Brak	-	Wszystkie grupy	święto	wolne
63427eb7-da88-42d7-afee-9a4b9f43da2c	EiAs2	2026-05-25	07:30:00	135	Analiza matematyczna	dr A. Pudełko	A2	W	Wykład	aktywne
5bc3d094-383a-4b6a-9070-2b7c93c3bb1c	EiAs2	2026-05-25	10:00:00	90	Analiza matematyczna	dr A. Pudełko	A2	Ć2	Ćwiczenia	aktywne
862d1fbd-eeba-4b50-9132-9e616e2b57a1	EiAs2	2026-05-25	10:00:00	90	Język angielski	mgr J. Firganek	136SJO	Lek5	Lektorat	aktywne
92edf89d-6928-4119-9f0a-63a27393af93	EiAs2	2026-05-25	10:00:00	90	Język angielski	mgr A. Zwierzyńska-Dubis	139SJO	Lek1	Lektorat	aktywne
845dee69-3749-418a-bcc4-0e07c9cf604c	EiAs2	2026-05-25	11:45:00	90	Analiza matematyczna	mgr M. Ból	A2	Ć1	Ćwiczenia	aktywne
3a27d192-21c8-4aae-8cae-79967431b394	EiAs2	2026-05-25	11:45:00	90	Język angielski	mgr J. Firganek	136SJO	Lek3	Lektorat	aktywne
3aeb24a1-3ad3-460c-a9a4-ea8ee5965b32	EiAs2	2026-05-25	11:45:00	90	Język niemiecki	mgr E. Targosz	139SJO	Lek	Lektorat	aktywne
c628d58b-bb31-49f9-8e5b-7470999d165d	EiAs2	2026-05-25	13:30:00	90	Analiza matematyczna	dr J. Czajkowski	A2	Ć3	Ćwiczenia	aktywne
96c82551-ab33-408f-be90-dfa079d195b8	EiAs2	2026-05-25	13:30:00	90	Język angielski	mgr J. Firganek	136SJO	Lek2	Lektorat	aktywne
b6cda77b-232b-4473-8f1a-eed1dae720e1	EiAs2	2026-05-25	13:30:00	90	Programowanie w C++	mgr inż. M. Raźny	19	P4	Projekt	aktywne
2b6ea97e-2720-4e1c-b7ef-7f0342241b7d	EiAs2	2026-05-25	15:15:00	90	Programowanie w C++	mgr inż. M. Raźny	19	P2	Projekt	aktywne
c830c069-1b78-46c1-bd3b-dc17767bf14f	EiAs2	2026-05-25	17:00:00	90	Geometria i grafika inżynierska w AUTOCAD	prof. P. Małka	18	P1	Projekt	aktywne
ad6a1a64-3ab5-414a-82d3-a1d268cbdcf3	EiAs2	2026-05-26	09:15:00	90	Podstawy elektroniki	prof. A. Szromba	A4	W	Wykład	aktywne
7213dc66-c668-40e6-a1d4-aba9a77b4f1a	EiAs2	2026-05-26	11:00:00	90	Język angielski	mgr A. Zwierzyńska-Dubis	150SJO	Lek4	Lektorat	aktywne
e2087060-2758-4b42-9e08-4b257a6cb004	EiAs2	2026-05-26	11:00:00	90	Podstawy elektroniki	prof. A. Szromba	A4	Ć1	Ćwiczenia	aktywne
cb23814a-8b34-4fc1-a66b-f074a240587d	EiAs2	2026-05-26	12:45:00	90	Programowanie w C++	dr inż. D. Gutenko	101B	P6	Projekt	aktywne
4371fcd8-253b-48b6-b0c6-9515a92002fe	EiAs2	2026-05-26	18:00:00	90	Programowanie w C++	dr inż. D. Gutenko	19	Lk6	Lab. Komp.	aktywne
f15bf40a-6a9a-4f35-9cb8-eaa48f91cc1e	EiAs2	2026-05-27	11:45:00	45	Podstawy elektroniki	mgr inż. M. Raźny	06	L5	Laboratoria	aktywne
29a26fae-7d02-4c13-80e7-d9a6f873fd4e	EiAs2	2026-05-27	11:45:00	90	Metody numeryczne	dr inż. G. Pędrak	202	Lk2	Lab. Komp.	aktywne
c33d6642-48f5-44aa-82c4-e1fb61dda43f	EiAs2	2026-05-27	11:45:00	90	Podstawy elektroniki	prof. A. Szromba	10	C_dodatkowa	Ćwiczenia	aktywne
556c4d7b-28c1-47e0-bb6a-fff514166fc2	EiAs2	2026-05-27	13:30:00	45	Podstawy elektroniki	mgr inż. M. Raźny	06	L6	Laboratoria	aktywne
d2486193-4e94-4a3a-a8e1-32db3d67bb81	EiAs2	2026-05-27	13:30:00	90	Metody numeryczne	dr inż. M. Orkisz	202	Lk5	Lab. Komp.	aktywne
6261e532-cd4a-479f-adff-4422740e2151	EiAs2	2026-05-27	13:30:00	90	Programowanie w C++	dr inż. D. Gutenko	19	Lk1	Lab. Komp.	aktywne
21256185-29e0-43cb-9bf7-db5050e05ae2	EiAs2	2026-05-27	15:15:00	45	Podstawy elektroniki	mgr inż. M. Raźny	06	L7	Laboratoria	aktywne
4eabfb42-ffd7-4409-bef1-4c2da0cb5094	EiAs2	2026-05-27	15:15:00	90	Metody numeryczne	dr inż. M. Orkisz	202	Lk6	Lab. Komp.	aktywne
95c9d167-e5ec-4d57-856d-4a12fdbcd94d	EiAs2	2026-05-27	15:15:00	90	Programowanie w C++	dr inż. D. Gutenko	19	Lk2	Lab. Komp.	aktywne
0e09c56d-033f-4428-b929-bee1a6f2fe75	EiAs2	2026-05-27	16:15:00	90	Język francuski	mgr B. Heil	139SJO	Lek	Lektorat	aktywne
df1843e2-3b81-4a78-9fe9-e32120dc68db	EiAs2	2026-05-27	17:00:00	45	Podstawy elektroniki	mgr inż. M. Raźny	06	L8	Laboratoria	aktywne
67f99050-480e-4038-badd-bfd30618fd3b	EiAs2	2026-05-27	17:00:00	90	Programowanie w C++	dr inż. D. Gutenko	19	Lk3	Lab. Komp.	aktywne
c73d4aea-4ac5-4bc6-9afd-40a17fe1c46e	EiAs2	2026-05-28	09:15:00	135	Programowanie w C++	dr inż. D. Gutenko	A3	W	Wykład	aktywne
ed3a2b9f-1a64-410e-937c-de69461df9c3	EiAs2	2026-05-28	10:00:00	90	Podstawy elektroniki	dr inż. A. Drwal	06	L_dodatkowa	Laboratoria	aktywne
32643ad0-6a95-4ca3-9eb8-85bb57006a7f	EiAs2	2026-05-28	11:45:00	45	Podstawy elektroniki	dr inż. A. Drwal	06	L9	Laboratoria	aktywne
de705f2f-d68e-4c5d-8d1f-b5f09773a871	EiAs2	2026-05-28	13:30:00	45	Podstawy elektroniki	dr inż. S. Żaba	06	L1	Laboratoria	aktywne
2ce3cea1-5150-4765-b7d8-d6af3e50542a	EiAs2	2026-05-28	14:15:00	45	Podstawy elektroniki	dr inż. S. Żaba	06	L2	Laboratoria	aktywne
17cc896d-038a-4ef6-afa2-6eecc627b962	EiAs2	2026-05-28	15:15:00	45	Podstawy elektroniki	dr inż. S. Żaba	06	L4	Laboratoria	aktywne
5b47e9e2-b984-42cf-8b92-e3a5fa877ffb	EiAs2	2026-05-28	16:15:00	135	Programowanie w C++	mgr inż. K. Kopera	101B	Lk4	Lab. Komp.	aktywne
2a0777b2-db1f-438e-b1a8-43a094842eb9	EiAs2	2026-05-28	18:45:00	45	Podstawy elektroniki	dr inż. S. Żaba	06	L3	Laboratoria	aktywne
d75a8fc0-0ec6-4cc7-920e-c7824e542813	EiAs2	2026-05-28	18:45:00	90	Geometria i grafika inżynierska w AUTOCAD	mgr inż. M. Gibas	13	P4	Projekt	aktywne
3cd627bb-71ce-41eb-81e3-7ce3b36185c0	EiAs2	2026-05-28	18:45:00	135	Programowanie w C++	mgr inż. K. Kopera	101B	Lk5	Lab. Komp.	aktywne
2d05a92f-568a-4a6e-84f7-a7535fdaba57	EiAs2	2026-05-29	08:15:00	135	Fizyka	K. Suchanek (op), J. Kurzyk, W. Chajec	F115	L1 / L2 / L3	Laboratoria	aktywne
9989c8fd-2337-4d49-a864-660f98e367fd	EiAs2	2026-05-29	12:45:00	45	Fizyka	W. Chajec	F203	Ć1	Ćwiczenia	aktywne
35dc545e-135d-400b-8711-a64587bb7118	EiAs2	2026-05-29	12:45:00	45	Fizyka	E. Borsuk	F204	Ć3	Ćwiczenia	aktywne
14a3df4b-ca19-47c2-8b28-df2d12e9fcb0	EiAs2	2026-05-29	12:45:00	45	Fizyka	B. Burtan-Gwizdała,	F112	Ć2	Ćwiczenia	aktywne
640b4ebb-c341-40b7-a1c8-b2da09583cfb	EiAs2	2026-06-01	07:30:00	135	Analiza matematyczna	dr A. Pudełko	A2	W	Wykład	aktywne
e88330c6-52c4-4fc4-9d36-4c33eb21f280	EiAs2	2026-06-01	10:00:00	90	Analiza matematyczna	dr A. Pudełko	A2	Ć2	Ćwiczenia	aktywne
9a487915-4519-4ee2-aa9b-d0d300d2e222	EiAs2	2026-06-01	10:00:00	90	Język angielski	mgr J. Firganek	136SJO	Lek5	Lektorat	aktywne
17a1802c-5766-4d5d-aea7-76784fc7b7de	EiAs2	2026-06-01	10:00:00	90	Język angielski	mgr A. Zwierzyńska-Dubis	139SJO	Lek1	Lektorat	aktywne
fd0c59f2-aec4-41aa-8afc-d0417e0ffbe1	EiAs2	2026-06-01	11:45:00	90	Analiza matematyczna	mgr M. Ból	A2	Ć1	Ćwiczenia	aktywne
b63f37f5-3092-4242-a7ef-0d885f4f3cbb	EiAs2	2026-06-01	11:45:00	90	Język angielski	mgr J. Firganek	136SJO	Lek3	Lektorat	aktywne
d29602f4-0d08-4f5f-b559-1ac0fe3585ef	EiAs2	2026-06-01	11:45:00	90	Język niemiecki	mgr E. Targosz	139SJO	Lek	Lektorat	aktywne
d8d753d0-f2ec-4134-9f1b-01fb3f710c3f	EiAs2	2026-06-01	13:30:00	90	Analiza matematyczna	dr J. Czajkowski	A2	Ć3	Ćwiczenia	aktywne
6fe5196f-c518-4f0b-8594-270971be35b2	EiAs2	2026-06-01	13:30:00	90	Język angielski	mgr J. Firganek	136SJO	Lek2	Lektorat	aktywne
a5658295-e051-41f0-a8fb-bab69bcb191e	EiAs2	2026-06-01	13:30:00	90	Programowanie w C++	mgr inż. M. Raźny	19	P1	Projekt	aktywne
77bf29b4-d2b9-4985-a6f1-28c50848de3c	EiAs2	2026-06-01	15:15:00	90	Programowanie w C++	mgr inż. M. Raźny	19	P5	Projekt	aktywne
d1865239-ef8f-4b08-a454-04f1ee6b2d98	EiAs2	2026-06-01	17:00:00	90	Programowanie w C++	mgr inż. M. Raźny	19	P3	Projekt	aktywne
f720a350-4428-4624-b97f-690624485bb1	EiAs2	2026-06-01	17:00:00	90	Geometria i grafika inżynierska w AUTOCAD	prof. P. Małka	18	P5	Projekt	aktywne
e14502d9-b4cc-4f62-ae91-9749184533f0	EiAs2	2026-06-02	07:30:00	90	Geometria i grafika inżynierska w AUTOCAD	prof. P. Małka	12	P2	Projekt	aktywne
5859d528-7aba-4e57-8e48-0666521ac685	EiAs2	2026-06-02	09:15:00	45	Podstawy elektroniki	prof. A. Szromba	A4	W	Wykład	aktywne
71d6b6ac-3597-4a04-86e9-f4d436e13a5a	EiAs2	2026-06-02	11:00:00	90	Język angielski	mgr A. Zwierzyńska-Dubis	150SJO	Lek4	Lektorat	aktywne
27e17491-67d1-4de6-ac28-cf8467ff27ed	EiAs2	2026-06-02	11:00:00	90	Podstawy elektroniki	prof. A. Szromba	A4	Ć2	Ćwiczenia	aktywne
3eb10b51-2f9e-43a5-b79e-5a0d3133a7d5	EiAs2	2026-06-02	14:30:00	90	Geometria i grafika inżynierska w AUTOCAD	dr inż. Z. Pilch	A4	W	Wykład	aktywne
94986ad4-76c8-41d0-8997-5884f5c2d641	EiAs2	2026-06-02	18:00:00	90	Programowanie w C++	dr inż. D. Gutenko	19	Lk6	Lab. Komp.	aktywne
753f0e5b-8748-4c90-862a-60e6a6bd4e7b	EiAs2	2026-06-02	19:45:00	90	Geometria i grafika inżynierska w AUTOCAD	prof. P. Małka	13	P6	Projekt	aktywne
9c718bfd-9236-4064-a081-af15b24719f5	EiAs2	2026-06-03	11:45:00	45	Podstawy elektroniki	prof. A. Szromba	10	Ć3	Ćwiczenia	aktywne
de61366b-ae93-4dff-b928-e81e1586aa93	EiAs2	2026-06-03	11:45:00	45	Metody numeryczne	dr inż. G. Pędrak	202	Lk1	Lab. Komp.	aktywne
91d7fd31-1a68-41f0-a918-528bf07bca9a	EiAs2	2026-06-03	13:30:00	45	Metody numeryczne	dr inż. M. Orkisz	202	Lk3	Lab. Komp.	aktywne
62db1a47-1c16-4adc-b218-32b88ac34a09	EiAs2	2026-06-03	13:30:00	90	Programowanie w C++	dr inż. D. Gutenko	19	Lk1	Lab. Komp.	aktywne
81dcfa23-ac8a-41d6-9062-396a05d3d646	EiAs2	2026-06-03	14:15:00	45	Metody numeryczne	dr inż. M. Orkisz	202	Lk5	Lab. Komp.	aktywne
72305b46-e3c2-499d-ac4b-fca304135c73	EiAs2	2026-06-03	15:15:00	45	Metody numeryczne	dr inż. M. Orkisz	202	Lk4	Lab. Komp.	aktywne
cd1386f6-92b8-45a3-b741-df1ff30b69bf	EiAs2	2026-06-03	15:15:00	90	Programowanie w C++	dr inż. D. Gutenko	19	Lk2	Lab. Komp.	aktywne
189e5057-fe9a-4ed5-bac5-5eded5205dac	EiAs2	2026-06-03	16:00:00	45	Metody numeryczne	dr inż. M. Orkisz	202	Lk6	Lab. Komp.	aktywne
e082ae52-edb7-40e9-a6bb-230ca0d7ea1b	EiAs2	2026-06-03	16:15:00	90	Język francuski	mgr B. Heil	139SJO	Lek	Lektorat	aktywne
4ae198c0-0f94-403a-9cc2-18cf0a2bf9ff	EiAs2	2026-06-03	17:00:00	90	Programowanie w C++	dr inż. D. Gutenko	19	Lk3	Lab. Komp.	aktywne
a788729b-9258-46cf-a2a8-69ab328f122a	EiAs2	2026-06-04	07:00:00	900	Boże Ciało	Brak	-	Wszystkie grupy	święto	wolne
2b26dff2-e868-4c84-8ced-7a4a5bf38f48	EiAs2	2026-06-05	07:00:00	900	Boże Ciało	Brak	-	Wszystkie grupy	święto	wolne
0057f4ff-93ae-4ce9-9c69-e6b390fc8fb9	EiAs2	2026-06-08	07:30:00	135	Analiza matematyczna	dr A. Pudełko	A2	W	Wykład	aktywne
a2a83c07-1d2f-4696-9a4a-4e047bf901c7	EiAs2	2026-06-08	10:00:00	90	Analiza matematyczna	dr A. Pudełko	A2	Ć2	Ćwiczenia	aktywne
6d6fa31a-e390-47cf-a63f-9d787bf7001f	EiAs2	2026-06-08	10:00:00	90	Język angielski	mgr J. Firganek	136SJO	Lek5	Lektorat	aktywne
a3baea05-15ac-4deb-9758-8ba7f9c6a403	EiAs2	2026-06-08	10:00:00	90	Język angielski	mgr A. Zwierzyńska-Dubis	139SJO	Lek1	Lektorat	aktywne
a74958d4-86fd-4461-b445-6c35d0a46aec	EiAs2	2026-06-08	11:45:00	90	Analiza matematyczna	mgr M. Ból	A2	Ć1	Ćwiczenia	aktywne
14a823fe-e9c8-4943-8860-fd37a004cb44	EiAs2	2026-06-08	11:45:00	90	Język angielski	mgr J. Firganek	136SJO	Lek3	Lektorat	aktywne
ea1aa0dc-779d-4429-bbff-92324c34cc2c	EiAs2	2026-06-08	11:45:00	90	Język niemiecki	mgr E. Targosz	139SJO	Lek	Lektorat	aktywne
db8a1840-06d0-49f9-9a00-8ce26ddc0e43	EiAs2	2026-06-08	13:30:00	90	Analiza matematyczna	dr J. Czajkowski	A2	Ć3	Ćwiczenia	aktywne
959dda98-7228-4edc-a812-539de6437072	EiAs2	2026-06-08	13:30:00	90	Język angielski	mgr J. Firganek	136SJO	Lek2	Lektorat	aktywne
94fa3786-b390-42ff-8ed6-40fb102bbe39	EiAs2	2026-06-08	13:30:00	45	Programowanie w C++	mgr inż. M. Raźny	19	P4	Projekt	aktywne
77cf8a1f-bfc8-4aa9-b3ff-500f1d21ec54	EiAs2	2026-06-08	15:15:00	45	Programowanie w C++	mgr inż. M. Raźny	19	P2	Projekt	aktywne
55ddb9aa-bc53-42a8-9104-7d17add110b6	EiAs2	2026-06-08	16:15:00	45	Programowanie w C++	mgr inż. M. Raźny	19	P1	Projekt	aktywne
7721656c-6cca-4115-a3cf-49a27d0689ed	EiAs2	2026-06-08	17:00:00	45	Geometria i grafika inżynierska w AUTOCAD	prof. P. Małka	18	P1	Projekt	aktywne
2bfb88c8-8ebf-4064-b345-92f9a0573804	EiAs2	2026-06-08	17:00:00	45	Programowanie w C++	mgr inż. M. Raźny	19	P3	Projekt	aktywne
e01c1b78-d2bb-474f-88a1-493583b9e987	EiAs2	2026-06-08	17:45:00	45	Programowanie w C++	mgr inż. M. Raźny	19	P5	Projekt	aktywne
d4d82af4-7585-4c05-8e4c-6c1441d73b76	EiAs2	2026-06-09	11:00:00	90	Język angielski	mgr A. Zwierzyńska-Dubis	150SJO	Lek4	Lektorat	aktywne
c6032d1d-d4e7-447d-88d2-fcf137b3b775	EiAs2	2026-06-09	11:00:00	135	Podstawy elektroniki	prof. A. Szromba	A4	Ć1	Ćwiczenia	aktywne
6773aa41-05f3-44f0-a9e0-6f7576e1ccc2	EiAs2	2026-06-09	12:45:00	90	Programowanie w C++	dr inż. D. Gutenko	101B	P6	Projekt	aktywne
61e89b4d-7fdf-42fe-98e3-edd7f4097caa	EiAs2	2026-06-09	18:00:00	90	Programowanie w C++	dr inż. D. Gutenko	19	Lk6	Lab. Komp.	aktywne
ed3ec2d4-3246-485e-b0eb-50d63b510305	EiAs2	2026-06-10	11:45:00	90	Metody numeryczne	dr inż. G. Pędrak	202	Lk2	Lab. Komp.	aktywne
b77855e8-647e-4ba6-b82f-a36dfc317199	EiAs2	2026-06-10	11:45:00	90	Podstawy elektroniki	prof. A. Szromba	10	C_dodatkowa	Ćwiczenia	aktywne
96ed2c08-0638-4c26-a659-e1807c60738c	EiAs2	2026-06-10	13:30:00	90	Metody numeryczne	dr inż. M. Orkisz	202	Lk5	Lab. Komp.	aktywne
22c44e83-4d57-40c0-8090-6d0465ca182a	EiAs2	2026-06-10	13:30:00	90	Programowanie w C++	dr inż. D. Gutenko	19	Lk1	Lab. Komp.	aktywne
3c11de75-c2e3-48eb-a7dd-c102672c3723	EiAs2	2026-06-10	15:15:00	90	Metody numeryczne	dr inż. M. Orkisz	202	Lk6	Lab. Komp.	aktywne
a1394e28-3dce-44a8-b63b-88e4a18e825a	EiAs2	2026-06-10	15:15:00	90	Programowanie w C++	dr inż. D. Gutenko	19	Lk2	Lab. Komp.	aktywne
c96ee3ae-1bf1-4d50-a7eb-0a89b825b421	EiAs2	2026-06-10	16:15:00	90	Język francuski	mgr B. Heil	139SJO	Lek	Lektorat	aktywne
306e8a02-d3b3-41ae-b997-c218a1901aea	EiAs2	2026-06-10	17:00:00	90	Programowanie w C++	dr inż. D. Gutenko	19	Lk3	Lab. Komp.	aktywne
407bdf94-5cfc-4e64-a839-fbafc1b66396	EiAs2	2026-06-11	10:00:00	135	Programowanie w C++	dr inż. D. Gutenko	A3	W	Wykład	aktywne
e33eac49-9635-427e-b794-d08d086042fb	EiAs2	2026-06-11	10:00:00	90	Podstawy elektroniki	dr inż. A. Drwal	06	L_dodatkowa	Laboratoria	aktywne
df68e71e-d7d6-40ab-9d2e-a166216470f6	EiAs2	2026-06-11	16:15:00	135	Programowanie w C++	mgr inż. K. Kopera	101B	Lk4	Lab. Komp.	aktywne
5d20801e-b0e7-4913-8743-200b8d020d6f	EiAs2	2026-06-11	18:45:00	135	Geometria i grafika inżynierska w AUTOCAD	mgr inż. M. Gibas	13	P4	Projekt	aktywne
63ad8167-74b6-4daa-8b14-85c65a3c51b8	EiAs2	2026-06-11	18:45:00	135	Programowanie w C++	mgr inż. K. Kopera	101B	Lk5	Lab. Komp.	aktywne
4e3c2c62-f49b-46ab-a6c7-931f1da77786	EiAs2	2026-06-12	08:15:00	135	Fizyka	K. Suchanek (op), J. Kurzyk, W. Chajec	F115	L1 / L2 / L3	Laboratoria	aktywne
e5c11624-2920-407c-b976-1ea13e743f43	EiAs2	2026-06-12	12:45:00	45	Fizyka	W. Chajec	F203	Ć1	Ćwiczenia	aktywne
5b1ab393-b3c6-4f20-ac83-5b281dace9eb	EiAs2	2026-06-12	12:45:00	45	Fizyka	E. Borsuk	F204	Ć3	Ćwiczenia	aktywne
d9d56bb6-ad1d-41a6-9e42-238499be0a16	EiAs2	2026-06-12	12:45:00	45	Fizyka	B. Burtan-Gwizdała,	F112	Ć2	Ćwiczenia	aktywne
ed8f76fc-2e32-4eef-91c4-2ad6bf44bd22	EiAs2	2026-06-15	07:30:00	135	Analiza matematyczna	dr A. Pudełko	A2	W	Wykład	aktywne
d471e812-4cb0-455a-b4b5-98b90e9192cd	EiAs2	2026-06-15	10:00:00	90	Analiza matematyczna	dr A. Pudełko	A2	Ć2	Ćwiczenia	aktywne
f3be0c69-d5c3-4eb6-aa54-9f1e04a12e07	EiAs2	2026-06-15	10:00:00	90	Język angielski	mgr J. Firganek	136SJO	Lek5	Lektorat	aktywne
7399a497-02a7-48ec-bf8a-03f4d41ed097	EiAs2	2026-06-15	10:00:00	90	Język angielski	mgr A. Zwierzyńska-Dubis	139SJO	Lek1	Lektorat	aktywne
71b1dd23-7d74-43f4-b338-58559a967019	EiAs2	2026-06-15	11:45:00	90	Analiza matematyczna	mgr M. Ból	A2	Ć1	Ćwiczenia	aktywne
cd9c1e8a-7789-4e86-a8cf-08d718a04086	EiAs2	2026-06-15	11:45:00	90	Język angielski	mgr J. Firganek	136SJO	Lek3	Lektorat	aktywne
9f7bd1e0-cfa8-426c-a9ae-8d3924ee5c8a	EiAs2	2026-06-15	11:45:00	90	Język niemiecki	mgr E. Targosz	139SJO	Lek	Lektorat	aktywne
c7933984-33e1-42d5-a33c-6b11961e82a0	EiAs2	2026-06-15	13:30:00	90	Analiza matematyczna	dr J. Czajkowski	A2	Ć3	Ćwiczenia	aktywne
443ffa7e-2981-4597-9d2f-81ce9d8d9f65	EiAs2	2026-06-15	13:30:00	90	Język angielski	mgr J. Firganek	136SJO	Lek2	Lektorat	aktywne
1c414eb1-f16d-461e-8eec-be3335feab3e	EiAs2	2026-06-15	13:30:00	90	Programowanie w C++	mgr inż. M. Raźny	19	P1	Projekt	aktywne
045f07a9-5885-4e70-a35f-700c3d694e6f	EiAs2	2026-06-15	15:15:00	90	Programowanie w C++	mgr inż. M. Raźny	19	P5	Projekt	aktywne
5532990b-4321-4976-a4eb-a24c9ceb7300	EiAs2	2026-06-15	17:00:00	90	Programowanie w C++	mgr inż. M. Raźny	19	P3	Projekt	aktywne
4db42046-eebc-44c1-b055-084cf14a59ec	EiAs2	2026-06-16	11:00:00	90	Język angielski	mgr A. Zwierzyńska-Dubis	150SJO	Lek4	Lektorat	aktywne
b814ee95-e230-4a92-b780-f28c9361cfed	EiAs2	2026-06-16	11:00:00	45	Podstawy elektroniki	prof. A. Szromba	A4	Ć2	Ćwiczenia	aktywne
39f237ef-13f4-4452-9459-40b68ee7f131	EiAs2	2026-06-16	14:30:00	45	Geometria i grafika inżynierska w AUTOCAD	dr inż. Z. Pilch	A4	W	Wykład	aktywne
01f63235-554c-425e-9597-04dd5821f0a7	EiAs2	2026-06-16	18:00:00	90	Programowanie w C++	dr inż. D. Gutenko	19	Lk6	Lab. Komp.	aktywne
5d10b1ac-bcaa-42b9-a4a1-23c15f8eb6d8	EiAs2	2026-06-16	19:45:00	45	Geometria i grafika inżynierska w AUTOCAD	prof. P. Małka	13	P6	Projekt	aktywne
7cf1a816-fd2b-4035-84c4-1c52a92abbb8	EiAs4	2026-02-23	07:30:00	90	Sieci i urządzenia elektryczne	dr inż. T. Sieńko	A4	W	wykład	aktywne
ff7814d9-cda9-4162-943e-51f3f169013a	EiAs4	2026-02-23	09:15:00	90	Maszyny elektryczne	dr inż. A. Shymanska	10	Ć1	laboratoria	aktywne
9959dcf6-d1b3-4ddd-bd45-3873e444e7ae	EiAs4	2026-02-23	09:15:00	90	Technika mikroprocesorowa	mgr inż. M. Raźny	208E	L6	laboratoria	aktywne
2976ce82-726e-452c-aee9-23809791cec3	EiAs4	2026-02-23	09:15:00	90	Sieci i urządzenia elektryczne	dr inż. T. Sieńko / mgr inż. D. Mamcarz	8	L4	laboratoria	aktywne
446ef443-42a1-4305-8cec-4880aea5b7d9	EiAs4	2026-02-23	09:15:00	90	Podstawy programowania w LabVIEW	mgr inż. K. Sołtys	12	Lk5	laboratoria	aktywne
5261c735-14a3-4492-8752-d3e0e8c68986	EiAs4	2026-02-23	11:00:00	90	Maszyny elektryczne	dr inż. A. Shymanska	10	Ć2	laboratoria	aktywne
35f28d1f-398a-4627-af70-c5daba25211b	EiAs4	2026-02-23	11:00:00	90	Energoelektronika	mgr inż. M. Wawro	A1	Ć3	laboratoria	aktywne
bdd9261c-4e3a-4726-b1a3-856e2ea5e865	EiAs4	2026-02-23	11:00:00	90	Sieci i urządzenia elektryczne	dr inż. T. Sieńko / mgr inż. D. Mamcarz	8	L1	laboratoria	aktywne
2a88154b-686c-496f-8ec4-6f8a4e44729e	EiAs4	2026-02-23	11:00:00	90	Podstawy programowania w LabVIEW	mgr inż. K. Sołtys	12	Lk2	laboratoria	aktywne
0f21d0a5-8acd-4b33-b58c-0c369a4c8982	EiAs4	2026-02-23	12:45:00	90	Technika mikroprocesorowa	dr inż. S. Żaba	06	L7 / P5	laboratoria	aktywne
578fd075-c9db-4f99-a332-913971e64c28	EiAs4	2026-02-23	12:45:00	90	Energoelektronika	mgr inż. M. Wawro	A1	Ć2	laboratoria	aktywne
d30db31b-082c-4319-924e-0376a8dcbd9d	EiAs4	2026-02-23	12:45:00	90	Podstawy programowania w LabVIEW	dr inż. T. Makowski / mgr inż. J. Zielonka	WA2	L1	laboratoria	aktywne
890b4f0e-9920-4806-89ba-ccd5049c0ff3	EiAs4	2026-02-23	14:30:00	90	Podstawy programowania w LabVIEW	dr inż. T. Makowski	A3	W	wykład	aktywne
3e900572-ea65-4e5f-8acb-bdb41112c9e5	EiAs4	2026-02-23	16:15:00	90	Podstawy programowania w LabVIEW	dr inż. T. Makowski / mgr inż. J. Zielonka	WA2	L3	laboratoria	aktywne
766c90c4-e76c-4a2b-b207-87495f69449d	EiAs4	2026-02-23	18:00:00	90	Podstawy programowania w LabVIEW	dr inż. T. Makowski / mgr inż. J. Zielonka	WA2	L5	laboratoria	aktywne
f2ee36b5-6815-4335-a5be-17f6988d5d7e	EiAs4	2026-02-23	19:45:00	90	Technika mikroprocesorowa	dr inż. A. Drwal	06	L8 / P6	laboratoria	aktywne
d8df73da-c630-4e60-88e5-a8e3a55dd6d1	EiAs4	2026-02-24	09:15:00	90	Maszyny elektryczne	dr inż. J. Tulicki / mgr inż. P. Oziębło	108D	L1 / L2	laboratoria	aktywne
bee8fef2-7a79-478f-befb-1bc12690217e	EiAs4	2026-02-24	09:15:00	90	Technika mikroprocesorowa	dr inż. K. Suchenia	208E	L3	laboratoria	aktywne
ea6c0a17-3939-4e70-802e-ff9d878ad4c7	EiAs4	2026-02-24	11:00:00	90	Maszyny elektryczne	dr inż. M. Sierżęga / mgr inż. T. Gębarowski	108D	L3 / L4	laboratoria	aktywne
74a95649-6908-45a4-a6d9-a03393960266	EiAs4	2026-02-24	11:00:00	90	Technika mikroprocesorowa	dr inż. K. Suchenia	208E	L1	laboratoria	aktywne
b08451bc-5f1f-4b3f-b88a-cdbebdb7bd19	EiAs4	2026-02-24	11:00:00	90	Język angielski	mgr J. Firganek	136SJO	Lek4	laboratoria	aktywne
855a440e-1172-4c65-9105-9791ca2477b2	EiAs4	2026-02-24	11:00:00	90	Sieci i urządzenia elektryczne	dr inż. T. Sieńko / mgr inż. D. Mamcarz	8	L2	laboratoria	aktywne
8450b10f-d357-493a-9b2c-3a9308aba730	EiAs4	2026-02-24	12:45:00	90	Maszyny elektryczne	dr inż. J. Tulicki / mgr inż. T. Gębarowski	108D	L5 / L6	laboratoria	aktywne
0a921951-31fb-479e-9450-b07905a28e9b	EiAs4	2026-02-24	12:45:00	90	Technika mikroprocesorowa	dr inż. K. Suchenia	208E	L4	laboratoria	aktywne
d2853b40-93a2-4b14-b8a5-306c9cabaa10	EiAs4	2026-02-24	12:45:00	90	Język angielski	mgr J. Firganek	139SJO	Lek1	laboratoria	aktywne
74f74b22-272c-466c-a87b-d4a43a8125e7	EiAs4	2026-02-24	12:45:00	90	Sieci i urządzenia elektryczne	dr inż. T. Sieńko / mgr inż. D. Mamcarz	8	L7	laboratoria	aktywne
970137f2-0c7d-489b-83d8-beee4f43b193	EiAs4	2026-02-24	14:30:00	90	Maszyny elektryczne	dr inż. J. Tulicki / dr inż. M. Sierżęga	A2	L7 / L8	laboratoria	aktywne
24ee8189-0bf4-4008-89f5-f7d96d6812f4	EiAs4	2026-02-24	14:30:00	90	Technika mikroprocesorowa	dr inż. K. Suchenia	208E	L2	laboratoria	aktywne
e4983cd6-202a-4787-81e4-f02c1fcf86b4	EiAs4	2026-02-24	14:30:00	90	Język angielski	mgr J. Firganek	139SJO	Lek2	laboratoria	aktywne
1d8d3762-2389-4c1b-bf52-62bd97b33f92	EiAs4	2026-02-24	16:15:00	90	Technika mikroprocesorowa	dr inż. K. Suchenia	208E	L5	laboratoria	aktywne
7ecafad3-9637-40e4-aab9-efd2d64418ac	EiAs4	2026-02-24	16:15:00	90	Podstawy programowania w LabVIEW	dr inż. T. Makowski / mgr inż. J. Zielonka	WA2	L8	laboratoria	aktywne
b947e178-eb14-4b55-9ac4-59a23fd3ee56	EiAs4	2026-02-25	08:30:00	90	Język niemiecki	mgr E. Targosz	139SJO	Lek	laboratoria	aktywne
5302f239-7a7c-442e-b5c1-22a5cf114f11	EiAs4	2026-02-25	10:30:00	120	Wychowanie fizyczne	CSiR	H/C	C	laboratoria	aktywne
a72ed5b7-47e4-4aa5-9017-149f83202540	EiAs4	2026-02-25	12:45:00	90	Technika mikroprocesorowa	dr inż. K. Suchenia	A4	W	wykład	aktywne
d4cf39d8-345e-4890-a811-8dbc6b033b16	EiAs4	2026-02-25	14:30:00	90	Maszyny elektryczne	prof. A. Warzecha / dr inż. J. Tulicki	A4	W	wykład	aktywne
745ded14-2ab5-4caa-9b8b-4327b69cbff3	EiAs4	2026-02-25	16:15:00	90	Układy elektromechaniczne	dr inż. Z. Pilch	A1	W	wykład	aktywne
98973efa-36ed-4f2d-976c-cfb4f2dc80fe	EiAs4	2026-02-25	18:00:00	90	Układy elektromechaniczne	dr inż. Z. Pilch	12	Lk5	laboratoria	aktywne
14e82638-9114-4ebb-a622-1fb0e6f98d35	EiAs4	2026-02-25	19:45:00	90	Układy elektromechaniczne	dr inż. Z. Pilch	12	Lk6	laboratoria	aktywne
9e452a62-c103-4fb9-882d-f402a8dae45b	EiAs4	2026-02-26	07:30:00	90	Podstawy programu Pspice	dr inż. Z. Szular	A4	W	wykład	aktywne
634e01df-abb5-41be-b6c6-b2f89f8bb39b	EiAs4	2026-02-26	09:15:00	135	Energoelektronika	dr inż. W. Czuchra / mgr inż. M. Wawro	013B	L1	laboratoria	aktywne
4abeda86-2a8e-437b-b0da-4647d0a273ea	EiAs4	2026-02-26	09:15:00	90	Maszyny elektryczne	dr inż. A. Shymanska	A1	Ć3	laboratoria	aktywne
af21f87b-a93f-4c5b-acb2-14aff1d65494	EiAs4	2026-02-26	09:15:00	90	Język angielski	mgr J. Firganek	139SJO	Lek3	laboratoria	aktywne
b9156fce-4436-4739-a25e-2c0a94f99b1d	EiAs4	2026-02-26	09:15:00	90	Podstawy programu Pspice	dr inż. Z. Szular	109B	Lk2	laboratoria	aktywne
7d56fed1-a9d3-4f3e-a444-1140108b170c	EiAs4	2026-02-26	11:00:00	90	Podstawy programu Pspice	dr inż. Z. Szular	109B	Lk3	laboratoria	aktywne
1f62a522-bc37-4287-90fa-5df215d17d70	EiAs4	2026-02-26	11:45:00	135	Energoelektronika	dr inż. W. Czuchra / mgr inż. M. Wawro	013B	L2	laboratoria	aktywne
4337897a-6333-441a-93ee-82433d228941	EiAs4	2026-02-26	12:30:00	90	Układy elektromechaniczne	dr inż. Z. Pilch	A1	Ć3	laboratoria	aktywne
a960ff8b-263f-4e6b-ab22-996652148619	EiAs4	2026-02-26	12:45:00	90	Podstawy programu Pspice	dr inż. Z. Szular	109B	Lk4	laboratoria	aktywne
e6abf155-f40e-4507-b1a8-25607b83ec6c	EiAs4	2026-02-26	14:15:00	135	Energoelektronika	dr inż. W. Czuchra / mgr inż. M. Wawro	013B	L5	laboratoria	aktywne
6192abfa-b5b4-42c1-b919-4f4c49e56741	EiAs4	2026-02-26	14:15:00	90	Układy elektromechaniczne	dr inż. Z. Pilch	12	Lk1	laboratoria	aktywne
654fb98b-1c77-4e60-a7a8-6fd675b53f9b	EiAs4	2026-02-26	16:00:00	90	Układy elektromechaniczne	dr inż. Z. Pilch	12	Lk2	laboratoria	aktywne
ff8e5c4d-cd69-4772-b0b6-c2907197fdc6	EiAs4	2026-02-26	16:45:00	135	Energoelektronika	dr inż. W. Czuchra / mgr inż. M. Wawro	013B	L4	laboratoria	aktywne
2acaac5b-dc5d-4b40-bf0f-8a1c906024d0	EiAs4	2026-02-26	17:45:00	90	Układy elektromechaniczne	dr inż. Z. Pilch	12	Lk4	laboratoria	aktywne
433c1584-e70f-49b3-abff-e1ce3f5c3da7	EiAs4	2026-02-26	19:30:00	90	Układy elektromechaniczne	dr inż. Z. Pilch	12	Lk3	laboratoria	aktywne
8c881377-dc30-4c9d-96e8-d56573f4a043	EiAs4	2026-02-27	10:00:00	135	Energoelektronika	prof. W. Mazgaj	A4	W	wykład	aktywne
e213035f-2431-407a-91f4-afa683409f68	EiAs4	2026-02-27	12:30:00	90	Energoelektronika	prof. W. Mazgaj	A4	Ć1	laboratoria	aktywne
22fda89b-f684-47b8-81eb-0b8072701425	EiAs4	2026-02-27	12:30:00	90	Układy elektromechaniczne	dr inż. Z. Pilch	10	Ć2	laboratoria	aktywne
ed37ccbe-6093-4429-b27f-5704e4b501b4	EiAs4	2026-03-02	09:15:00	90	Maszyny elektryczne	dr inż. A. Shymanska	10	Ć1	laboratoria	aktywne
30f599bc-3268-4139-9a6d-1e372ca7a10a	EiAs4	2026-03-02	09:15:00	90	Technika mikroprocesorowa	mgr inż. M. Raźny	208E	L6	laboratoria	aktywne
2386b2d4-05ed-42f0-8471-83bf951caba4	EiAs4	2026-03-02	09:15:00	90	Sieci i urządzenia elektryczne	dr inż. T. Sieńko / mgr inż. D. Mamcarz	8	L5	laboratoria	aktywne
4cc697e8-cc93-45ba-91ee-bda2e4959e47	EiAs4	2026-03-02	09:15:00	90	Podstawy programowania w LabVIEW	mgr inż. K. Sołtys	12	Lk6	laboratoria	aktywne
6d33c695-2542-4a2e-9433-ade7b1054959	EiAs4	2026-03-02	11:00:00	90	Maszyny elektryczne	dr inż. A. Shymanska	10	Ć2	laboratoria	aktywne
56fca6fe-2c57-4266-98e8-0b3ad4286dd4	EiAs4	2026-03-02	11:00:00	90	Energoelektronika	mgr inż. M. Wawro	A1	Ć3	laboratoria	aktywne
616937e5-af10-4dae-91ce-96e8b9068a82	EiAs4	2026-03-02	11:00:00	90	Sieci i urządzenia elektryczne	dr inż. T. Sieńko / mgr inż. D. Mamcarz	8	L3	laboratoria	aktywne
79277d33-2c61-4313-95c3-e9b842bdb703	EiAs4	2026-03-02	11:00:00	90	Podstawy programowania w LabVIEW	mgr inż. K. Sołtys	12	Lk1	laboratoria	aktywne
88623125-f2ab-4c30-848f-02e3252ca721	EiAs4	2026-03-02	12:45:00	90	Technika mikroprocesorowa	dr inż. S. Żaba	06	L7 / P5	laboratoria	aktywne
a1ce931b-9195-49eb-9a86-c4174f6b6ef6	EiAs4	2026-03-02	12:45:00	90	Energoelektronika	mgr inż. M. Wawro	A1	Ć2	laboratoria	aktywne
6d74bd9d-9b1f-4ba2-8bc1-9635485c90ae	EiAs4	2026-03-02	12:45:00	90	Podstawy programowania w LabVIEW	dr inż. T. Makowski / mgr inż. J. Zielonka	WA2	L2	laboratoria	aktywne
2863952c-cfa3-46c3-89dd-793706411eea	EiAs4	2026-03-02	14:30:00	90	Podstawy programowania w LabVIEW	dr inż. T. Makowski / mgr inż. J. Zielonka	WA2	L7	laboratoria	aktywne
49c158ac-a0a5-4195-a8fa-1f1665aa2cf9	EiAs4	2026-03-02	14:30:00	90	Podstawy programowania w LabVIEW	mgr inż. K. Sołtys	12	Lk3	laboratoria	aktywne
4891096e-1dbc-46be-bb76-88659a0d6791	EiAs4	2026-03-02	16:15:00	90	Podstawy programowania w LabVIEW	dr inż. T. Makowski / mgr inż. J. Zielonka	WA2	L4	laboratoria	aktywne
22f66f90-efb3-4cca-8b86-6b0fd8693e32	EiAs4	2026-03-02	16:15:00	90	Podstawy programowania w LabVIEW	mgr inż. K. Sołtys	12	Lk4	laboratoria	aktywne
0cc681ce-42c1-4bf5-88e2-f3f8fa44bfc0	EiAs4	2026-03-02	18:00:00	90	Podstawy programowania w LabVIEW	dr inż. T. Makowski / mgr inż. J. Zielonka	WA2	L6	laboratoria	aktywne
c803d87c-406b-4a55-8ba1-39d8bdea14e3	EiAs4	2026-03-02	19:45:00	90	Technika mikroprocesorowa	dr inż. A. Drwal	06	L8 / P6	laboratoria	aktywne
cd6391a0-3083-47f7-b4a6-f97c91718535	EiAs4	2026-03-03	09:15:00	90	Maszyny elektryczne	dr inż. J. Tulicki / mgr inż. P. Oziębło	01A / 01B	L1 / L2	laboratoria	aktywne
ec457edf-2f62-42d2-b143-db7adaa12069	EiAs4	2026-03-03	09:15:00	90	Technika mikroprocesorowa	dr inż. K. Suchenia	208E	L3	laboratoria	aktywne
77d52927-10e8-45f4-a588-b163025647c4	EiAs4	2026-03-03	11:00:00	90	Maszyny elektryczne	dr inż. M. Sierżęga / mgr inż. T. Gębarowski	01A / 01B	L3 / L4	laboratoria	aktywne
56db0b62-7f0c-42fa-8254-b028bf7a50b7	EiAs4	2026-03-03	11:00:00	90	Technika mikroprocesorowa	dr inż. K. Suchenia	208E	L1	laboratoria	aktywne
a7955429-fcc5-4648-b292-3a3c74aead4d	EiAs4	2026-03-03	11:00:00	90	Język angielski	mgr J. Firganek	136SJO	Lek4	laboratoria	aktywne
af49d5e5-9d2e-485e-a131-b99801817ebe	EiAs4	2026-03-03	11:00:00	90	Sieci i urządzenia elektryczne	dr inż. T. Sieńko / mgr inż. D. Mamcarz	8	L6	laboratoria	aktywne
6a6ec867-fbe0-4e2c-818c-ed051ac5efce	EiAs4	2026-03-03	12:45:00	90	Maszyny elektryczne	dr inż. J. Tulicki / mgr inż. T. Gębarowski	01A / 01B	L5 / L6	laboratoria	aktywne
8e43c5dc-5700-40f0-b2ae-b5c7cde8c954	EiAs4	2026-03-03	12:45:00	90	Technika mikroprocesorowa	dr inż. K. Suchenia	208E	L4	laboratoria	aktywne
47072613-1a0d-4454-bcd6-da083e20998a	EiAs4	2026-03-03	12:45:00	90	Język angielski	mgr J. Firganek	139SJO	Lek1	laboratoria	aktywne
b09142e0-138b-4de1-9e28-b639bfce70a8	EiAs4	2026-03-03	12:45:00	90	Sieci i urządzenia elektryczne	dr inż. T. Sieńko / mgr inż. D. Mamcarz	8	L8	laboratoria	aktywne
0fdf7e09-02d2-4cd0-a317-53ec28f3a5c5	EiAs4	2026-03-03	14:30:00	90	Maszyny elektryczne	dr inż. J. Tulicki / dr inż. M. Sierżęga	01A / 01B	L7 / L8	laboratoria	aktywne
e09c7919-62cf-445b-a346-ff67b340db1d	EiAs4	2026-03-03	14:30:00	90	Technika mikroprocesorowa	dr inż. K. Suchenia	208E	L2	laboratoria	aktywne
91887309-fae5-4334-8e1a-1478caa0a751	EiAs4	2026-03-03	14:30:00	90	Język angielski	mgr J. Firganek	139SJO	Lek2	laboratoria	aktywne
6d5e7242-f2cd-4a7b-8ca3-67cd3b6a12a7	EiAs4	2026-03-03	16:15:00	90	Technika mikroprocesorowa	dr inż. K. Suchenia	208E	L5	laboratoria	aktywne
fd1a2fb0-d6d3-4f2f-bbec-907911d113cd	EiAs4	2026-03-04	08:30:00	90	Język niemiecki	mgr E. Targosz	139SJO	Lek	laboratoria	aktywne
d550601c-8405-4b22-bfdf-fe51c751bd1d	EiAs4	2026-03-04	10:30:00	120	Wychowanie fizyczne	CSiR	H/C	C	laboratoria	aktywne
6c10eb4a-a23f-4b75-88c7-e91cd2cc2464	EiAs4	2026-03-04	12:45:00	90	Technika mikroprocesorowa	dr inż. K. Suchenia	A4	W	wykład	aktywne
f7eface0-1bef-44cc-9483-010ae6a4a702	EiAs4	2026-03-04	14:30:00	90	Maszyny elektryczne	prof. A. Warzecha / dr inż. J. Tulicki	A4	W	wykład	aktywne
9dd4925d-fabc-49a9-aa66-80b32ffa3fe5	EiAs4	2026-03-04	16:15:00	90	Układy elektromechaniczne	dr inż. Z. Pilch	A1	W	wykład	aktywne
9c0bde03-4d6f-4b0c-873e-e5f625b11d48	EiAs4	2026-03-04	18:00:00	90	Układy elektromechaniczne	dr inż. Z. Pilch	12	P5	laboratoria	aktywne
4f0beeef-4875-47c9-8644-b06e75521a84	EiAs4	2026-03-04	19:45:00	90	Układy elektromechaniczne	dr inż. Z. Pilch	12	P6	laboratoria	aktywne
bd9b0504-9a25-49a6-b920-b731687fd684	EiAs4	2026-03-05	07:30:00	90	Podstawy programu Pspice	dr inż. Z. Szular	A4	W	wykład	aktywne
f40cde1f-6d9c-47b0-a0da-f05a46c4ff5b	EiAs4	2026-03-05	09:15:00	135	Energoelektronika	dr inż. W. Czuchra / mgr inż. M. Wawro	013B	L3	laboratoria	aktywne
7ce4c0fd-4e44-47cf-9af4-4568b224c0a4	EiAs4	2026-03-05	09:15:00	90	Maszyny elektryczne	dr inż. A. Shymanska	A1	Ć3	laboratoria	aktywne
c4af817e-9b7a-447c-9cdd-9473321bc02b	EiAs4	2026-03-05	09:15:00	90	Język angielski	mgr J. Firganek	139SJO	Lek3	laboratoria	aktywne
5bfe24a7-e2b8-499f-9056-3460f6e27463	EiAs4	2026-03-05	09:15:00	90	Podstawy programu Pspice	dr inż. Z. Szular	109B	Lk1	laboratoria	aktywne
58699ff5-3d41-4185-a9e2-3f234920011e	EiAs4	2026-03-05	11:00:00	90	Podstawy programu Pspice	dr inż. Z. Szular	109B	Lk6	laboratoria	aktywne
00ff9537-69ba-4086-b6d8-89555304f6dc	EiAs4	2026-03-05	11:45:00	135	Energoelektronika	dr inż. W. Czuchra / mgr inż. M. Wawro	013B	L6	laboratoria	aktywne
60f9c6e1-f09d-4732-b2c1-5b522e53cd49	EiAs4	2026-03-05	12:30:00	90	Układy elektromechaniczne	dr inż. Z. Pilch	A1	Ć1	laboratoria	aktywne
a05b555f-07c1-4b3c-aaf8-5e2686c5e201	EiAs4	2026-03-05	12:45:00	90	Podstawy programu Pspice	dr inż. Z. Szular	109B	Lk5	laboratoria	aktywne
f2304997-b3ff-483d-b5ca-4b1ceb1eaaf3	EiAs4	2026-03-05	14:15:00	135	Energoelektronika	dr inż. W. Czuchra / mgr inż. M. Wawro	013B	L7	laboratoria	aktywne
ac6abbac-b302-4ffa-8f52-641daa6fbb1c	EiAs4	2026-03-05	14:15:00	90	Układy elektromechaniczne	dr inż. Z. Pilch	12	P1	laboratoria	aktywne
897c746b-a392-498f-8772-52750471e5a5	EiAs4	2026-03-05	16:00:00	90	Układy elektromechaniczne	dr inż. Z. Pilch	12	P3	laboratoria	aktywne
ea8d5b7c-7562-438a-8371-1848e02204b4	EiAs4	2026-03-05	16:45:00	135	Energoelektronika	dr inż. W. Czuchra / mgr inż. M. Wawro	013B	L8	laboratoria	aktywne
b9dde723-c57c-455e-9336-8f5e409c7f00	EiAs4	2026-03-05	17:45:00	90	Układy elektromechaniczne	dr inż. Z. Pilch	12	P2	laboratoria	aktywne
8022bff6-f400-476a-a7a9-06882c6b3c7b	EiAs4	2026-03-05	19:30:00	90	Układy elektromechaniczne	dr inż. Z. Pilch	12	P4	laboratoria	aktywne
5f70780f-3301-4cdf-b592-b531b8f4739d	EiAs4	2026-03-06	10:00:00	135	Energoelektronika	prof. W. Mazgaj	A4	W	wykład	aktywne
fada848b-e63a-4db8-9a4f-366d40e64522	EiAs4	2026-03-06	12:30:00	90	Energoelektronika	prof. W. Mazgaj	A4	Ć1	laboratoria	aktywne
e01f73ee-0320-41af-aa28-506fa824f6be	EiAs4	2026-03-09	07:30:00	90	Sieci i urządzenia elektryczne	dr inż. T. Sieńko	A4	W	wykład	aktywne
74712271-23f8-4c36-97de-e9df589b9814	EiAs4	2026-03-09	09:15:00	90	Maszyny elektryczne	dr inż. A. Shymanska	10	Ć1	laboratoria	aktywne
0ab8843f-d091-4704-a26a-d8e59517394d	EiAs4	2026-03-09	09:15:00	90	Technika mikroprocesorowa	mgr inż. M. Raźny	208E	L6	laboratoria	aktywne
76393c23-76d8-4374-a471-6edbd77d888a	EiAs4	2026-03-09	09:15:00	90	Sieci i urządzenia elektryczne	dr inż. T. Sieńko / mgr inż. D. Mamcarz	8	L4	laboratoria	aktywne
930ecfcf-442c-4d14-b563-657f4c842701	EiAs4	2026-03-09	09:15:00	90	Podstawy programowania w LabVIEW	mgr inż. K. Sołtys	12	Lk5	laboratoria	aktywne
e4b50dfa-e8ed-49fe-a7fe-2324900cd92b	EiAs4	2026-03-09	11:00:00	90	Maszyny elektryczne	dr inż. A. Shymanska	10	Ć2	laboratoria	aktywne
83eee4ad-fff2-4881-8567-e577f7d24ae1	EiAs4	2026-03-09	11:00:00	90	Energoelektronika	mgr inż. M. Wawro	A1	Ć3	laboratoria	aktywne
f95803c4-eaf2-4619-8ccc-265edc739a32	EiAs4	2026-03-09	11:00:00	90	Sieci i urządzenia elektryczne	dr inż. T. Sieńko / mgr inż. D. Mamcarz	8	L1	laboratoria	aktywne
b34e93f5-f6dd-42fc-8a12-69906d82694e	EiAs4	2026-03-09	11:00:00	90	Podstawy programowania w LabVIEW	mgr inż. K. Sołtys	12	Lk2	laboratoria	aktywne
b8d69cfb-114d-41c2-85de-cc9c821cea80	EiAs4	2026-03-09	12:45:00	90	Technika mikroprocesorowa	dr inż. S. Żaba	06	L7 / P5	laboratoria	aktywne
1fb47eb6-46df-48fb-9cef-41dd30b5966e	EiAs4	2026-03-09	12:45:00	90	Energoelektronika	mgr inż. M. Wawro	A1	Ć2	laboratoria	aktywne
cece7bb1-2305-4f47-9b82-ff2a39f45799	EiAs4	2026-03-09	12:45:00	90	Podstawy programowania w LabVIEW	dr inż. T. Makowski / mgr inż. J. Zielonka	WA2	L1	laboratoria	aktywne
df6ec4c0-42cd-4945-b95e-25e7140b8fa6	EiAs4	2026-03-09	14:30:00	90	Podstawy programowania w LabVIEW	dr inż. T. Makowski	A3	W	wykład	aktywne
be5194e8-4c5f-4419-aaba-c15b8b3ca9ec	EiAs4	2026-03-09	16:15:00	90	Podstawy programowania w LabVIEW	dr inż. T. Makowski / mgr inż. J. Zielonka	WA2	L3	laboratoria	aktywne
31554dcb-c39c-4a50-8f37-86cf8c984b7a	EiAs4	2026-03-09	18:00:00	90	Podstawy programowania w LabVIEW	dr inż. T. Makowski / mgr inż. J. Zielonka	WA2	L5	laboratoria	aktywne
1a0f0d7d-2138-4b1b-8c65-601a3e7bef5a	EiAs4	2026-03-09	19:45:00	90	Technika mikroprocesorowa	dr inż. A. Drwal	06	L8 / P6	laboratoria	aktywne
a890d514-8727-4f8e-a432-8adb672309ed	EiAs4	2026-03-10	09:15:00	90	Maszyny elektryczne	dr inż. J. Tulicki / mgr inż. P. Oziębło	108D	L1 / L2	laboratoria	aktywne
d41404a4-1a27-4f25-9a9f-ed8f2984128c	EiAs4	2026-03-10	09:15:00	90	Technika mikroprocesorowa	dr inż. K. Suchenia	208E	L3	laboratoria	aktywne
596f4a2e-8d15-4a2a-9adc-6546043f5568	EiAs4	2026-03-10	09:15:00	90	Sieci i urządzenia elektryczne	dr inż. T. Sieńko	A1	Ć2	laboratoria	aktywne
87360956-3f05-4515-b29e-80d101da2d10	EiAs4	2026-03-10	11:00:00	90	Maszyny elektryczne	dr inż. M. Sierżęga / mgr inż. T. Gębarowski	108D	L3 / L4	laboratoria	aktywne
09cb4f7b-b3d1-4edc-8a39-a1831ffd34c0	EiAs4	2026-03-10	11:00:00	90	Technika mikroprocesorowa	dr inż. K. Suchenia	208E	L1	laboratoria	aktywne
bef1b702-d268-43b4-b9e8-c3d261fb81b4	EiAs4	2026-03-10	11:00:00	90	Język angielski	mgr J. Firganek	136SJO	Lek4	laboratoria	aktywne
8aa5df24-29d1-4ec3-a78d-c1970b6bf625	EiAs4	2026-03-10	11:00:00	90	Sieci i urządzenia elektryczne	dr inż. T. Sieńko / mgr inż. D. Mamcarz	8	L2	laboratoria	aktywne
c3d77ef3-5095-41e4-b160-321d371f6b82	EiAs4	2026-03-10	12:45:00	90	Maszyny elektryczne	dr inż. J. Tulicki / mgr inż. T. Gębarowski	108D	L5 / L6	laboratoria	aktywne
cc1d9829-0982-40bd-90b1-4aad62bcbbca	EiAs4	2026-03-10	12:45:00	90	Technika mikroprocesorowa	dr inż. K. Suchenia	208E	L4	laboratoria	aktywne
6cae7eed-4309-4fbd-b26d-77852a6868e5	EiAs4	2026-03-10	12:45:00	90	Język angielski	mgr J. Firganek	139SJO	Lek1	laboratoria	aktywne
c97ff50f-deea-4be5-991d-c6716d9d18c5	EiAs4	2026-03-10	12:45:00	90	Sieci i urządzenia elektryczne	dr inż. T. Sieńko / mgr inż. D. Mamcarz	8	L7	laboratoria	aktywne
e3f72ba1-d04d-486b-9c60-cc1f5700b74b	EiAs4	2026-03-10	14:30:00	90	Maszyny elektryczne	dr inż. J. Tulicki / dr inż. M. Sierżęga	A2	L7 / L8	laboratoria	aktywne
36824637-9340-4047-89ec-5f25706dc264	EiAs4	2026-03-10	14:30:00	90	Technika mikroprocesorowa	dr inż. K. Suchenia	208E	L2	laboratoria	aktywne
b728cbae-9a04-4724-9e84-34c93eb68cc2	EiAs4	2026-03-10	14:30:00	90	Język angielski	mgr J. Firganek	139SJO	Lek2	laboratoria	aktywne
22f70263-7fb8-4c03-a9f1-8e8ae4b32027	EiAs4	2026-03-10	16:15:00	90	Technika mikroprocesorowa	dr inż. K. Suchenia	208E	L5	laboratoria	aktywne
c0850a05-0d5b-4e6b-859f-973e553976bf	EiAs4	2026-03-10	16:15:00	90	Podstawy programowania w LabVIEW	dr inż. T. Makowski / mgr inż. J. Zielonka	WA2	L8	laboratoria	aktywne
486a6e38-31ed-424f-98b2-81dd2de780f1	EiAs4	2026-03-11	08:30:00	90	Język niemiecki	mgr E. Targosz	139SJO	Lek	laboratoria	aktywne
052bcc55-ab07-41c8-b31a-9b495b20f05d	EiAs4	2026-03-11	10:30:00	120	Wychowanie fizyczne	CSiR	H/C	C	laboratoria	aktywne
073bc5c9-e136-4446-9f8c-c4cefe52cc66	EiAs4	2026-03-11	12:45:00	90	Technika mikroprocesorowa	dr inż. K. Suchenia	A4	W	wykład	aktywne
eeee58a0-a71d-43dc-923e-13a3b374e2c3	EiAs4	2026-03-11	14:30:00	90	Maszyny elektryczne	prof. A. Warzecha / dr inż. J. Tulicki	A4	W	wykład	aktywne
9bab9b7f-9bfa-4d4a-912a-a6a7103b6147	EiAs4	2026-03-11	16:15:00	90	Układy elektromechaniczne	dr inż. Z. Pilch	A1	W	wykład	aktywne
b66e7579-1605-4a82-a647-df20aa42a802	EiAs4	2026-03-11	18:00:00	90	Układy elektromechaniczne	dr inż. Z. Pilch	12	Lk5	laboratoria	aktywne
7aca61d9-3480-466b-b1a2-72be9839fdd6	EiAs4	2026-03-11	19:45:00	90	Układy elektromechaniczne	dr inż. Z. Pilch	12	Lk6	laboratoria	aktywne
94719cc0-925b-4d48-9e07-764a513308f9	EiAs4	2026-03-12	07:30:00	90	Podstawy programu Pspice	dr inż. Z. Szular	A4	W	wykład	aktywne
a4380dbd-e087-48c4-a904-f9be169ddc94	EiAs4	2026-03-12	09:15:00	135	Energoelektronika	dr inż. W. Czuchra / mgr inż. M. Wawro	013B	L1	laboratoria	aktywne
bee5128a-ef38-46d5-b820-9bbe4d25bde9	EiAs4	2026-03-12	09:15:00	90	Maszyny elektryczne	dr inż. A. Shymanska	A1	Ć3	laboratoria	aktywne
b851a7c4-de09-43ef-a200-000e58b3bc19	EiAs4	2026-03-12	09:15:00	90	Język angielski	mgr J. Firganek	139SJO	Lek3	laboratoria	aktywne
d278696a-ab87-4124-81f3-d4931e7dea9c	EiAs4	2026-03-12	09:15:00	90	Podstawy programu Pspice	dr inż. Z. Szular	109B	Lk2	laboratoria	aktywne
6fe998f8-71ee-41f9-844d-e331e5e18fd6	EiAs4	2026-03-12	11:00:00	90	Podstawy programu Pspice	dr inż. Z. Szular	109B	Lk3	laboratoria	aktywne
bfd5d5d1-e32c-4122-b851-06dc4573b5ea	EiAs4	2026-03-12	11:45:00	135	Energoelektronika	dr inż. W. Czuchra / mgr inż. M. Wawro	013B	L2	laboratoria	aktywne
cf5129ed-4e37-49ed-99b9-645ae0ea3404	EiAs4	2026-03-12	12:30:00	90	Układy elektromechaniczne	dr inż. Z. Pilch	A1	Ć3	laboratoria	aktywne
825c09e7-a5b9-4877-bbe2-43d720891ec8	EiAs4	2026-03-12	12:45:00	90	Podstawy programu Pspice	dr inż. Z. Szular	109B	Lk4	laboratoria	aktywne
7bee7281-edf5-47fc-b341-75b122c5fd2f	EiAs4	2026-03-12	14:15:00	135	Energoelektronika	dr inż. W. Czuchra / mgr inż. M. Wawro	013B	L5	laboratoria	aktywne
9931752f-18c6-49e2-b4aa-cf85a47efc7b	EiAs4	2026-03-12	14:15:00	90	Układy elektromechaniczne	dr inż. Z. Pilch	12	Lk1	laboratoria	aktywne
f2d224e6-e51d-4541-ac8c-6699fcb35d3c	EiAs4	2026-03-12	16:00:00	90	Układy elektromechaniczne	dr inż. Z. Pilch	12	Lk2	laboratoria	aktywne
141cc496-f9c2-40ea-ab8b-efc1bec529ed	EiAs4	2026-03-12	16:45:00	135	Energoelektronika	dr inż. W. Czuchra / mgr inż. M. Wawro	013B	L4	laboratoria	aktywne
708b2096-d539-4142-9596-b155cb97b9a8	EiAs4	2026-03-12	17:45:00	90	Układy elektromechaniczne	dr inż. Z. Pilch	12	Lk4	laboratoria	aktywne
823e974b-eaa0-4156-bc68-741b5bfd1cd3	EiAs4	2026-03-12	19:30:00	90	Układy elektromechaniczne	dr inż. Z. Pilch	12	Lk3	laboratoria	aktywne
3075eed0-7eeb-49f4-8feb-d7eb7b9b55b1	EiAs4	2026-03-13	11:45:00	135	Układy elektromechaniczne	dr inż. Z. Pilch	10	Ć2	laboratoria	aktywne
d3708dcc-6b68-4b01-809f-55b8d5f782cf	EiAs4	2026-03-16	07:30:00	90	Sieci i urządzenia elektryczne	mgr inż. S. Nachman	A4	Ć1	laboratoria	aktywne
bd85981f-8444-4a56-9540-93f970771c69	EiAs4	2026-03-16	09:15:00	90	Maszyny elektryczne	dr inż. A. Shymanska	10	Ć1	laboratoria	aktywne
16109823-6614-4a85-afa1-24d00213648e	EiAs4	2026-03-16	09:15:00	90	Technika mikroprocesorowa	mgr inż. M. Raźny	208E	L6	laboratoria	aktywne
e772446f-56c2-4eb5-9a72-828be6ab11d7	EiAs4	2026-03-16	09:15:00	90	Sieci i urządzenia elektryczne	dr inż. T. Sieńko / mgr inż. D. Mamcarz	8	L5	laboratoria	aktywne
668cd748-1fb0-42e0-9ba4-472b0f2794ea	EiAs4	2026-03-16	09:15:00	90	Podstawy programowania w LabVIEW	mgr inż. K. Sołtys	12	Lk6	laboratoria	aktywne
2b0e657e-42b5-490b-bf72-39d51646e28a	EiAs4	2026-03-16	11:00:00	90	Maszyny elektryczne	dr inż. A. Shymanska	10	Ć2	laboratoria	aktywne
ac55745a-d0c0-4735-b371-786778f0f271	EiAs4	2026-03-16	11:00:00	90	Energoelektronika	mgr inż. M. Wawro	A1	Ć3	laboratoria	aktywne
c71ee74c-6c41-4b89-981c-6b2d45bc77a3	EiAs4	2026-03-16	11:00:00	90	Sieci i urządzenia elektryczne	dr inż. T. Sieńko / mgr inż. D. Mamcarz	8	L3	laboratoria	aktywne
23475df0-8326-4f66-8401-23abac600679	EiAs4	2026-03-16	11:00:00	90	Podstawy programowania w LabVIEW	mgr inż. K. Sołtys	12	Lk1	laboratoria	aktywne
aec4af9a-6298-424d-828e-fe13447c4917	EiAs4	2026-03-16	12:45:00	90	Technika mikroprocesorowa	dr inż. S. Żaba	06	L7 / P5	laboratoria	aktywne
3bd2681b-3f94-47ad-8452-06c38d629889	EiAs4	2026-03-16	12:45:00	90	Energoelektronika	mgr inż. M. Wawro	A1	Ć2	laboratoria	aktywne
b6745ab1-ed34-469e-b2e9-4278cdfc13df	EiAs4	2026-03-16	12:45:00	90	Podstawy programowania w LabVIEW	dr inż. T. Makowski / mgr inż. J. Zielonka	WA2	L2	laboratoria	aktywne
de4749ad-0fe4-474e-bf51-0f29a86e9a18	EiAs4	2026-03-16	14:30:00	90	Podstawy programowania w LabVIEW	dr inż. T. Makowski / mgr inż. J. Zielonka	WA2	L7	laboratoria	aktywne
ac66cc5b-c979-4b01-9b2d-27dbf428f915	EiAs4	2026-03-16	14:30:00	90	Podstawy programowania w LabVIEW	mgr inż. K. Sołtys	12	Lk3	laboratoria	aktywne
8a548686-fad2-48f1-bd44-98093529a02d	EiAs4	2026-03-16	16:15:00	90	Podstawy programowania w LabVIEW	dr inż. T. Makowski / mgr inż. J. Zielonka	WA2	L4	laboratoria	aktywne
d536e65d-bbe0-49f3-ba98-5f78b53b5e65	EiAs4	2026-03-16	16:15:00	90	Podstawy programowania w LabVIEW	mgr inż. K. Sołtys	12	Lk4	laboratoria	aktywne
fe3e1e47-c96a-48f9-b335-c4ec67ff7e0a	EiAs4	2026-03-16	18:00:00	90	Podstawy programowania w LabVIEW	dr inż. T. Makowski / mgr inż. J. Zielonka	WA2	L6	laboratoria	aktywne
b9ccabe2-750b-4711-9c17-fabf42d9e589	EiAs4	2026-03-16	19:45:00	90	Technika mikroprocesorowa	dr inż. A. Drwal	06	L8 / P6	laboratoria	aktywne
f13c361f-1704-4bcf-a625-fb634dda97de	EiAs4	2026-03-17	09:15:00	90	Maszyny elektryczne	dr inż. J. Tulicki / mgr inż. P. Oziębło	01A / 01B	L1 / L2	laboratoria	aktywne
50fe0924-8b6f-43ae-bb5e-7fb8e0a5979d	EiAs4	2026-03-17	09:15:00	90	Technika mikroprocesorowa	dr inż. K. Suchenia	208E	L3	laboratoria	aktywne
b85e6139-be09-4695-a93f-9663fe174664	EiAs4	2026-03-17	09:15:00	90	Sieci i urządzenia elektryczne	dr inż. T. Sieńko	A1	Ć3	laboratoria	aktywne
7298ac00-0a95-48e1-9519-1a7372af4856	EiAs4	2026-03-17	11:00:00	90	Maszyny elektryczne	dr inż. M. Sierżęga / mgr inż. T. Gębarowski	01A / 01B	L3 / L4	laboratoria	aktywne
d3a2d4d0-81c7-4aee-9602-20d8e8e9fd2f	EiAs4	2026-03-17	11:00:00	90	Technika mikroprocesorowa	dr inż. K. Suchenia	208E	L1	laboratoria	aktywne
fa73b39d-a892-4ae4-894e-2161c2145e1c	EiAs4	2026-03-17	11:00:00	90	Język angielski	mgr J. Firganek	136SJO	Lek4	laboratoria	aktywne
59914232-d54e-4ea7-9b21-17eccaa5b80f	EiAs4	2026-03-17	11:00:00	90	Sieci i urządzenia elektryczne	dr inż. T. Sieńko / mgr inż. D. Mamcarz	8	L6	laboratoria	aktywne
ffc41977-b503-4589-8458-dc53769da7f3	EiAs4	2026-03-17	12:45:00	90	Maszyny elektryczne	dr inż. J. Tulicki / mgr inż. T. Gębarowski	01A / 01B	L5 / L6	laboratoria	aktywne
a8c96df2-5697-4e85-8b32-39cedeab8a1c	EiAs4	2026-03-17	12:45:00	90	Technika mikroprocesorowa	dr inż. K. Suchenia	208E	L4	laboratoria	aktywne
6937ed41-8c49-4ff9-aded-b45563776a1d	EiAs4	2026-03-17	12:45:00	90	Język angielski	mgr J. Firganek	139SJO	Lek1	laboratoria	aktywne
5f372e5d-37bc-4b5d-b2e3-8c18f342cbfe	EiAs4	2026-03-17	12:45:00	90	Sieci i urządzenia elektryczne	dr inż. T. Sieńko / mgr inż. D. Mamcarz	8	L8	laboratoria	aktywne
cb21676d-169d-4dc7-abc5-2edfe04d8c3c	EiAs4	2026-03-17	14:30:00	90	Maszyny elektryczne	dr inż. J. Tulicki / dr inż. M. Sierżęga	01A / 01B	L7 / L8	laboratoria	aktywne
df9d931d-e6c9-4fbc-87b8-607234b9c647	EiAs4	2026-03-17	14:30:00	90	Technika mikroprocesorowa	dr inż. K. Suchenia	208E	L2	laboratoria	aktywne
ec8e5cf4-930e-4543-ba9a-dc118dfa39fe	EiAs4	2026-03-17	14:30:00	90	Język angielski	mgr J. Firganek	139SJO	Lek2	laboratoria	aktywne
7e89e3b2-d651-4b6d-9dc5-a36995051a08	EiAs4	2026-03-17	16:15:00	90	Technika mikroprocesorowa	dr inż. K. Suchenia	208E	L5	laboratoria	aktywne
205d3633-d272-42d8-8f53-10faf7422adc	EiAs4	2026-03-18	08:30:00	90	Język niemiecki	mgr E. Targosz	139SJO	Lek	laboratoria	aktywne
187c788b-2356-4de0-81d2-1ecbd834ae4c	EiAs4	2026-03-18	10:30:00	120	Wychowanie fizyczne	CSiR	H/C	C	laboratoria	aktywne
be215747-28f1-4ed9-8f3b-46fcab107695	EiAs4	2026-03-18	12:45:00	90	Technika mikroprocesorowa	dr inż. K. Suchenia	A4	W	wykład	aktywne
6cf217b6-67b6-4df8-8d16-8cce64027771	EiAs4	2026-03-18	14:30:00	90	Maszyny elektryczne	prof. A. Warzecha / dr inż. J. Tulicki	A4	W	wykład	aktywne
6a6a8996-723e-457d-a831-fe6ca14b17cd	EiAs4	2026-03-18	16:15:00	90	Układy elektromechaniczne	dr inż. Z. Pilch	A1	W	wykład	aktywne
8b253953-bb7b-4201-bf7e-57eda86b6420	EiAs4	2026-03-18	18:00:00	90	Układy elektromechaniczne	dr inż. Z. Pilch	12	P5	laboratoria	aktywne
93820280-f065-4491-af2b-45e3e81eb604	EiAs4	2026-03-18	19:45:00	90	Układy elektromechaniczne	dr inż. Z. Pilch	12	P6	laboratoria	aktywne
5c43daac-eb0e-4d7e-aa7d-69be0e761736	EiAs4	2026-03-19	07:30:00	90	Podstawy programu Pspice	dr inż. Z. Szular	A4	W	wykład	aktywne
773bbe52-e898-484b-9fd7-fe52141225d2	EiAs4	2026-03-19	09:15:00	135	Energoelektronika	dr inż. W. Czuchra / mgr inż. M. Wawro	013B	L3	laboratoria	aktywne
b428a2fe-f085-4f8c-92e9-285507d6d5f5	EiAs4	2026-03-19	09:15:00	90	Maszyny elektryczne	dr inż. A. Shymanska	A1	Ć3	laboratoria	aktywne
20f9c867-4343-4e65-aea2-c1682d207164	EiAs4	2026-03-19	09:15:00	90	Język angielski	mgr J. Firganek	139SJO	Lek3	laboratoria	aktywne
4fece37c-0ae9-40d7-98d7-630bd968bdcf	EiAs4	2026-03-19	09:15:00	90	Podstawy programu Pspice	dr inż. Z. Szular	109B	Lk1	laboratoria	aktywne
4f35cda7-290f-405a-b5c0-643a46694a7b	EiAs4	2026-03-19	11:00:00	90	Podstawy programu Pspice	dr inż. Z. Szular	109B	Lk6	laboratoria	aktywne
469ce954-cdb9-4122-aaa9-6ae1c4e67da8	EiAs4	2026-03-19	11:45:00	135	Energoelektronika	dr inż. W. Czuchra / mgr inż. M. Wawro	013B	L6	laboratoria	aktywne
0136aa2c-a6f5-405b-b031-2f13f53ebc17	EiAs4	2026-03-19	12:30:00	90	Układy elektromechaniczne	dr inż. Z. Pilch	A1	Ć1	laboratoria	aktywne
0d79c3e5-662f-4db8-824e-497a553b63c6	EiAs4	2026-03-19	12:45:00	90	Podstawy programu Pspice	dr inż. Z. Szular	109B	Lk5	laboratoria	aktywne
c36fefc7-f537-4728-83b4-da65830e0b07	EiAs4	2026-03-19	14:15:00	135	Energoelektronika	dr inż. W. Czuchra / mgr inż. M. Wawro	013B	L7	laboratoria	aktywne
03d61798-f5a0-4db3-9c63-d6d7a3493740	EiAs4	2026-03-19	14:15:00	90	Układy elektromechaniczne	dr inż. Z. Pilch	12	P1	laboratoria	aktywne
ec01b53a-14b1-47bd-8aa4-fb5f18de50e8	EiAs4	2026-03-19	16:00:00	90	Układy elektromechaniczne	dr inż. Z. Pilch	12	P3	laboratoria	aktywne
0898943e-abaa-4170-9031-e3f5fefb1c1e	EiAs4	2026-03-19	16:45:00	135	Energoelektronika	dr inż. W. Czuchra / mgr inż. M. Wawro	013B	L8	laboratoria	aktywne
c9569232-6a72-4ca0-a163-3907dd1db8eb	EiAs4	2026-03-19	17:45:00	90	Układy elektromechaniczne	dr inż. Z. Pilch	12	P2	laboratoria	aktywne
7389075a-97b4-4003-a175-c1f00643c214	EiAs4	2026-03-19	19:30:00	90	Układy elektromechaniczne	dr inż. Z. Pilch	12	P4	laboratoria	aktywne
458c1713-4e63-458a-91c6-5cec1e15da56	EiAs4	2026-03-20	10:00:00	135	Energoelektronika	prof. W. Mazgaj	A4	W	wykład	aktywne
de37ad64-6a71-4365-8dbb-2dd0bab4674f	EiAs4	2026-03-20	12:30:00	90	Energoelektronika	prof. W. Mazgaj	A4	Ć1	laboratoria	aktywne
150464e9-cfdc-43ae-8d4f-eb514e8239cc	EiAs4	2026-03-23	07:30:00	90	Sieci i urządzenia elektryczne	dr inż. T. Sieńko	A4	W	wykład	aktywne
59e9e80b-abf8-4bc0-9024-8587455b5099	EiAs4	2026-03-23	09:15:00	90	Maszyny elektryczne	dr inż. A. Shymanska	10	Ć1	laboratoria	aktywne
4a4122c9-d363-41a4-b647-91c3ff19908e	EiAs4	2026-03-23	09:15:00	90	Technika mikroprocesorowa	mgr inż. M. Raźny	208E	L6	laboratoria	aktywne
f8f81d1d-4dca-4dfd-98f0-32b3a748579d	EiAs4	2026-03-23	09:15:00	90	Sieci i urządzenia elektryczne	dr inż. T. Sieńko / mgr inż. D. Mamcarz	8	L4	laboratoria	aktywne
b9688fe2-55a8-4765-b572-8e8cfd88e18b	EiAs4	2026-03-23	09:15:00	90	Podstawy programowania w LabVIEW	mgr inż. K. Sołtys	12	Lk5	laboratoria	aktywne
c599b478-850f-4fc7-8161-0b4d2becdecd	EiAs4	2026-03-23	11:00:00	90	Maszyny elektryczne	dr inż. A. Shymanska	10	Ć2	laboratoria	aktywne
7a03195b-204d-4642-92ab-604a698ae870	EiAs4	2026-03-23	11:00:00	90	Energoelektronika	mgr inż. M. Wawro	A1	Ć3	laboratoria	aktywne
fd526526-3c5f-47ee-833c-2ad38eec2c4d	EiAs4	2026-03-23	11:00:00	90	Sieci i urządzenia elektryczne	dr inż. T. Sieńko / mgr inż. D. Mamcarz	8	L1	laboratoria	aktywne
9fc30635-4d3a-4c0e-9935-29d6ff97597f	EiAs4	2026-03-23	11:00:00	90	Podstawy programowania w LabVIEW	mgr inż. K. Sołtys	12	Lk2	laboratoria	aktywne
5478b508-5788-42c6-860e-af94e65bb268	EiAs4	2026-03-23	12:45:00	90	Technika mikroprocesorowa	dr inż. S. Żaba	06	L7 / P5	laboratoria	aktywne
ad06f479-a18b-4cdd-b569-bb4b9bb20c62	EiAs4	2026-03-23	12:45:00	90	Energoelektronika	mgr inż. M. Wawro	A1	Ć2	laboratoria	aktywne
ed5046b6-465f-4f54-a4ca-3a26e07fd772	EiAs4	2026-03-23	12:45:00	90	Podstawy programowania w LabVIEW	dr inż. T. Makowski / mgr inż. J. Zielonka	WA2	L1	laboratoria	aktywne
4d1119a4-9839-4b2d-8e6a-e3ee4d83dfff	EiAs4	2026-03-23	14:30:00	90	Podstawy programowania w LabVIEW	dr inż. T. Makowski	A3	W	wykład	aktywne
6a6d1bf8-66e1-4a44-a9f9-ce6888dc6a31	EiAs4	2026-03-23	16:15:00	90	Podstawy programowania w LabVIEW	dr inż. T. Makowski / mgr inż. J. Zielonka	WA2	L3	laboratoria	aktywne
8182ef2e-c667-4b16-bb2a-b0ad8652dcc6	EiAs4	2026-03-23	18:00:00	90	Podstawy programowania w LabVIEW	dr inż. T. Makowski / mgr inż. J. Zielonka	WA2	L5	laboratoria	aktywne
1ea1ec69-446c-4c63-aaf9-a0953b25d157	EiAs4	2026-03-23	19:45:00	90	Technika mikroprocesorowa	dr inż. A. Drwal	06	L8 / P6	laboratoria	aktywne
e935bc31-a3bc-4f6c-9600-1428ca251552	EiAs4	2026-03-24	09:15:00	90	Maszyny elektryczne	dr inż. J. Tulicki / mgr inż. P. Oziębło	01A / 01B	L1 / L2	laboratoria	aktywne
a1cef2f3-d862-4454-902c-20cbd4860cea	EiAs4	2026-03-24	09:15:00	90	Technika mikroprocesorowa	dr inż. K. Suchenia	208E	L3	laboratoria	aktywne
9ba527cf-570d-4916-ad95-c39f4809dc0c	EiAs4	2026-03-24	09:15:00	90	Sieci i urządzenia elektryczne	dr inż. T. Sieńko	A1	Ć2	laboratoria	aktywne
7c0fad9f-4e89-427a-8f64-3b1b08cf1471	EiAs4	2026-03-24	11:00:00	90	Maszyny elektryczne	dr inż. M. Sierżęga / mgr inż. T. Gębarowski	01A / 01B	L3 / L4	laboratoria	aktywne
fed1f6be-4f4f-41d4-9c04-e2db04cce4ad	EiAs4	2026-03-24	11:00:00	90	Technika mikroprocesorowa	dr inż. K. Suchenia	208E	L1	laboratoria	aktywne
f9f56cb7-d5ea-4f79-b8f5-b5a26d3315f8	EiAs4	2026-03-24	11:00:00	90	Język angielski	mgr J. Firganek	136SJO	Lek4	laboratoria	aktywne
28ba0f86-1c1c-46b0-84b0-d9351380667b	EiAs4	2026-03-24	11:00:00	90	Sieci i urządzenia elektryczne	dr inż. T. Sieńko / mgr inż. D. Mamcarz	8	L2	laboratoria	aktywne
f73d14cd-f026-47a3-a3d0-21860e41c28f	EiAs4	2026-03-24	12:45:00	90	Maszyny elektryczne	dr inż. J. Tulicki / mgr inż. T. Gębarowski	01A / 01B	L5 / L6	laboratoria	aktywne
87a9309a-196b-45a6-867e-ba46c3b29f2c	EiAs4	2026-03-24	12:45:00	90	Technika mikroprocesorowa	dr inż. K. Suchenia	208E	L4	laboratoria	aktywne
7823c40c-8764-40cb-9e0e-44ec765022dc	EiAs4	2026-03-24	12:45:00	90	Język angielski	mgr J. Firganek	139SJO	Lek1	laboratoria	aktywne
5276b844-e57c-43ea-a91c-5e9d3206b126	EiAs4	2026-03-24	12:45:00	90	Sieci i urządzenia elektryczne	dr inż. T. Sieńko / mgr inż. D. Mamcarz	8	L7	laboratoria	aktywne
79d1f678-efc0-4d24-888b-5ed42c31c0e0	EiAs4	2026-03-24	14:30:00	90	Maszyny elektryczne	dr inż. J. Tulicki / dr inż. M. Sierżęga	01A / 01B	L7 / L8	laboratoria	aktywne
bb4fb13a-c870-4da3-b901-efae40e0de32	EiAs4	2026-03-24	14:30:00	90	Technika mikroprocesorowa	dr inż. K. Suchenia	208E	L2	laboratoria	aktywne
f7bcf2e2-d687-4ee5-8906-f9358ac1c70a	EiAs4	2026-03-24	14:30:00	90	Język angielski	mgr J. Firganek	139SJO	Lek2	laboratoria	aktywne
0f19d481-b166-4ee9-9fc1-44760cdbafe1	EiAs4	2026-03-24	16:15:00	90	Technika mikroprocesorowa	dr inż. K. Suchenia	208E	L5	laboratoria	aktywne
143bf4d0-e9c7-4dd2-b3ff-d4078e0fdd81	EiAs4	2026-03-24	16:15:00	90	Podstawy programowania w LabVIEW	dr inż. T. Makowski / mgr inż. J. Zielonka	WA2	L8	laboratoria	aktywne
32aa3182-efdd-4549-9ed4-4492852a2cac	EiAs4	2026-03-25	08:30:00	90	Język niemiecki	mgr E. Targosz	139SJO	Lek	laboratoria	aktywne
3a141627-9db8-46cd-a35d-e82238bbcbc5	EiAs4	2026-03-25	10:30:00	120	Wychowanie fizyczne	CSiR	H/C	C	laboratoria	aktywne
2037d284-10bc-48ab-a1b1-4889452b403a	EiAs4	2026-03-25	12:45:00	90	Technika mikroprocesorowa	dr inż. K. Suchenia	A4	W	wykład	aktywne
c84f0193-a341-4146-abec-06521c14ec70	EiAs4	2026-03-25	14:30:00	90	Maszyny elektryczne	prof. A. Warzecha / dr inż. J. Tulicki	A4	W	wykład	aktywne
b5f2089a-b649-4818-a441-c4a4b544e4fd	EiAs4	2026-03-25	16:15:00	90	Układy elektromechaniczne	dr inż. Z. Pilch	A1	W	wykład	aktywne
7138fa68-c989-4615-8d6c-51c980bc658b	EiAs4	2026-03-25	18:00:00	90	Układy elektromechaniczne	dr inż. Z. Pilch	12	Lk5	laboratoria	aktywne
6667d351-4c4e-4b48-86c5-d325e52a49c3	EiAs4	2026-03-25	19:45:00	90	Układy elektromechaniczne	dr inż. Z. Pilch	12	Lk6	laboratoria	aktywne
d5ca6f8e-52e7-471b-9fec-4c57b75ecc0b	EiAs4	2026-03-26	07:30:00	90	Podstawy programu Pspice	dr inż. Z. Szular	A4	W	wykład	aktywne
81b11777-a2c4-40fd-8642-9638350c95a8	EiAs4	2026-03-26	09:15:00	135	Energoelektronika	dr inż. W. Czuchra / mgr inż. M. Wawro	013B	L1	laboratoria	aktywne
09179456-b499-4666-b261-e7f8df0f7209	EiAs4	2026-03-26	09:15:00	90	Maszyny elektryczne	dr inż. A. Shymanska	A1	Ć3	laboratoria	aktywne
4a2c220d-517c-4fb1-b2aa-59a99f8f9dea	EiAs4	2026-03-26	09:15:00	90	Język angielski	mgr J. Firganek	139SJO	Lek3	laboratoria	aktywne
29737158-e2c9-417e-8ef5-49d6cd8f61e9	EiAs4	2026-03-26	09:15:00	90	Podstawy programu Pspice	dr inż. Z. Szular	109B	Lk2	laboratoria	aktywne
76efe36a-75d6-45c4-8abe-8707af553bee	EiAs4	2026-03-26	11:00:00	90	Podstawy programu Pspice	dr inż. Z. Szular	109B	Lk3	laboratoria	aktywne
00d1c897-157b-41d7-a07e-c5f6240630cc	EiAs4	2026-03-26	11:45:00	135	Energoelektronika	dr inż. W. Czuchra / mgr inż. M. Wawro	013B	L2	laboratoria	aktywne
43404439-3eaa-4289-b35a-326313cc3ee8	EiAs4	2026-03-26	12:30:00	90	Układy elektromechaniczne	dr inż. Z. Pilch	A1	Ć3	laboratoria	aktywne
fdaf4ed7-a552-4b0b-bb6d-81fc73be305c	EiAs4	2026-03-26	12:45:00	90	Podstawy programu Pspice	dr inż. Z. Szular	109B	Lk4	laboratoria	aktywne
dbd701fe-59c4-4dee-9ad2-3b7d900b3b3e	EiAs4	2026-03-26	14:15:00	135	Energoelektronika	dr inż. W. Czuchra / mgr inż. M. Wawro	013B	L5	laboratoria	aktywne
8d86c1ee-c5f6-444f-9ff1-653082f4e2ff	EiAs4	2026-03-26	14:15:00	90	Układy elektromechaniczne	dr inż. Z. Pilch	12	Lk1	laboratoria	aktywne
99f9ea3d-a7dc-42ef-89cf-872d030daea3	EiAs4	2026-03-26	16:00:00	90	Układy elektromechaniczne	dr inż. Z. Pilch	12	Lk2	laboratoria	aktywne
459765ae-576c-4bc1-989e-b309d22da0b5	EiAs4	2026-03-26	16:45:00	135	Energoelektronika	dr inż. W. Czuchra / mgr inż. M. Wawro	013B	L4	laboratoria	aktywne
f2fbe828-5d25-4e76-993f-40c6b8dd0a6c	EiAs4	2026-03-26	17:45:00	90	Układy elektromechaniczne	dr inż. Z. Pilch	12	Lk4	laboratoria	aktywne
8c97dc89-a2a4-4043-b23b-7feb118d13a2	EiAs4	2026-03-26	19:30:00	90	Układy elektromechaniczne	dr inż. Z. Pilch	12	Lk3	laboratoria	aktywne
976d7cc3-ab7a-4a33-8ca3-69e2b27fac57	EiAs4	2026-03-27	10:00:00	135	Energoelektronika	prof. W. Mazgaj	A4	W	wykład	aktywne
79392f57-dcda-42d0-b52d-b1fc8f5575b0	EiAs4	2026-03-27	12:30:00	90	Energoelektronika	prof. W. Mazgaj	A4	Ć1	laboratoria	aktywne
7dfd3588-5a6b-4f3d-b978-42759cdbc17c	EiAs4	2026-03-27	12:30:00	90	Układy elektromechaniczne	dr inż. Z. Pilch	10	Ć2	laboratoria	aktywne
c366bb94-7de1-4bc4-8edc-4565c7ef8883	EiAs4	2026-03-30	07:30:00	90	Sieci i urządzenia elektryczne	mgr inż. S. Nachman	A4	Ć1	laboratoria	aktywne
51a4e752-e99d-4574-80bc-d9b4c69b7355	EiAs4	2026-03-30	09:15:00	90	Maszyny elektryczne	dr inż. A. Shymanska	10	Ć1	laboratoria	aktywne
a0be5f54-ca77-4052-a98e-6b3939918d11	EiAs4	2026-03-30	09:15:00	90	Technika mikroprocesorowa	mgr inż. M. Raźny	208E	L6	laboratoria	aktywne
0496becb-f82d-486b-8f30-63314b31f675	EiAs4	2026-03-30	09:15:00	90	Sieci i urządzenia elektryczne	dr inż. T. Sieńko / mgr inż. D. Mamcarz	8	L5	laboratoria	aktywne
62750a16-7639-4874-9e81-9b4281112ea4	EiAs4	2026-03-30	09:15:00	90	Podstawy programowania w LabVIEW	mgr inż. K. Sołtys	12	Lk6	laboratoria	aktywne
b513c952-e8b4-454e-8eb9-ecf1355ccfd1	EiAs4	2026-03-30	11:00:00	90	Maszyny elektryczne	dr inż. A. Shymanska	10	Ć2	laboratoria	aktywne
5fc56598-1145-43c4-a7ec-ad7d562e213d	EiAs4	2026-03-30	11:00:00	90	Energoelektronika	mgr inż. M. Wawro	A1	Ć3	laboratoria	aktywne
cdc1cd47-2986-4375-a747-da4b509aba0b	EiAs4	2026-03-30	11:00:00	90	Sieci i urządzenia elektryczne	dr inż. T. Sieńko / mgr inż. D. Mamcarz	8	L3	laboratoria	aktywne
ffb3465d-eb4f-468b-a42b-cec16cec44d8	EiAs4	2026-03-30	11:00:00	90	Podstawy programowania w LabVIEW	mgr inż. K. Sołtys	12	Lk1	laboratoria	aktywne
542d8d0a-d356-43f3-91d9-35ca8456c08f	EiAs4	2026-03-30	12:45:00	90	Technika mikroprocesorowa	dr inż. S. Żaba	06	L7 / P5	laboratoria	aktywne
6fdcaf45-d142-4692-a589-0d8a3ed653ee	EiAs4	2026-03-30	12:45:00	90	Energoelektronika	mgr inż. M. Wawro	A1	Ć2	laboratoria	aktywne
3498f02c-a5a1-48ab-8711-3f84e0556d47	EiAs4	2026-03-30	12:45:00	90	Podstawy programowania w LabVIEW	dr inż. T. Makowski / mgr inż. J. Zielonka	WA2	L2	laboratoria	aktywne
6db17199-32a0-403c-8870-f7071b3a1747	EiAs4	2026-03-30	14:30:00	90	Podstawy programowania w LabVIEW	dr inż. T. Makowski / mgr inż. J. Zielonka	WA2	L7	laboratoria	aktywne
689ab876-85e4-48b1-b2f2-594db2de0809	EiAs4	2026-03-30	14:30:00	90	Podstawy programowania w LabVIEW	mgr inż. K. Sołtys	12	Lk3	laboratoria	aktywne
98874a27-a163-4417-877c-f6b6c96d20fc	EiAs4	2026-03-30	16:15:00	90	Podstawy programowania w LabVIEW	dr inż. T. Makowski / mgr inż. J. Zielonka	WA2	L4	laboratoria	aktywne
f9d53bd2-8b6e-467a-b1e3-54b32cf9a882	EiAs4	2026-03-30	16:15:00	90	Podstawy programowania w LabVIEW	mgr inż. K. Sołtys	12	Lk4	laboratoria	aktywne
1d537850-3609-43de-a148-8a234e1ee077	EiAs4	2026-03-30	18:00:00	90	Podstawy programowania w LabVIEW	dr inż. T. Makowski / mgr inż. J. Zielonka	WA2	L6	laboratoria	aktywne
9cb3a165-3254-496f-abda-d68493c7efc0	EiAs4	2026-03-30	19:45:00	90	Technika mikroprocesorowa	dr inż. A. Drwal	06	L8 / P6	laboratoria	aktywne
0e28c980-658b-44be-b26c-3dcc9f8d2781	EiAs4	2026-03-31	09:15:00	90	Maszyny elektryczne	dr inż. J. Tulicki / mgr inż. P. Oziębło	01A / 01B	L1 / L2	laboratoria	aktywne
3a42cd01-ccae-4904-8a86-7881ca8777d9	EiAs4	2026-03-31	09:15:00	90	Technika mikroprocesorowa	dr inż. K. Suchenia	208E	L3	laboratoria	aktywne
06347b8a-2fb6-4a9c-a942-f71290eeafd1	EiAs4	2026-03-31	09:15:00	90	Sieci i urządzenia elektryczne	dr inż. T. Sieńko	A1	Ć3	laboratoria	aktywne
21b6bc03-3521-4b0e-83eb-722189d95406	EiAs4	2026-03-31	11:00:00	90	Maszyny elektryczne	dr inż. M. Sierżęga / mgr inż. T. Gębarowski	01A / 01B	L3 / L4	laboratoria	aktywne
2156d5a3-3db8-4e0b-bf68-ee419fb5173e	EiAs4	2026-03-31	11:00:00	90	Technika mikroprocesorowa	dr inż. K. Suchenia	208E	L1	laboratoria	aktywne
2a7649e0-81f7-4c18-8288-3e6030612ae0	EiAs4	2026-03-31	11:00:00	90	Język angielski	mgr J. Firganek	136SJO	Lek4	laboratoria	aktywne
7b00280e-31eb-4886-8037-d6c503cd94c1	EiAs4	2026-03-31	11:00:00	90	Sieci i urządzenia elektryczne	dr inż. T. Sieńko / mgr inż. D. Mamcarz	8	L6	laboratoria	aktywne
7cd1ef79-725f-4109-a53f-66eec3694dd4	EiAs4	2026-03-31	12:45:00	90	Maszyny elektryczne	dr inż. J. Tulicki / mgr inż. T. Gębarowski	01A / 01B	L5 / L6	laboratoria	aktywne
80124227-bbbc-48de-b86b-9d47793031ef	EiAs4	2026-03-31	12:45:00	90	Technika mikroprocesorowa	dr inż. K. Suchenia	208E	L4	laboratoria	aktywne
25ed94cc-d0b5-4b97-8dd4-02ea18ddbe9f	EiAs4	2026-03-31	12:45:00	90	Język angielski	mgr J. Firganek	139SJO	Lek1	laboratoria	aktywne
8be391e5-862f-4700-88a7-202a91469c8a	EiAs4	2026-03-31	12:45:00	90	Sieci i urządzenia elektryczne	dr inż. T. Sieńko / mgr inż. D. Mamcarz	8	L8	laboratoria	aktywne
8850ead2-0961-4e2c-9d93-3d383590b041	EiAs4	2026-03-31	14:30:00	90	Maszyny elektryczne	dr inż. J. Tulicki / dr inż. M. Sierżęga	01A / 01B	L7 / L8	laboratoria	aktywne
2ba01497-3003-46eb-9b60-1887cf105ff1	EiAs4	2026-03-31	14:30:00	90	Technika mikroprocesorowa	dr inż. K. Suchenia	208E	L2	laboratoria	aktywne
82f9a896-d221-48df-b39c-5ffda396a9e8	EiAs4	2026-03-31	14:30:00	90	Język angielski	mgr J. Firganek	139SJO	Lek2	laboratoria	aktywne
d0644a9d-41c3-435f-a009-518130f5ea81	EiAs4	2026-03-31	16:15:00	90	Technika mikroprocesorowa	dr inż. K. Suchenia	208E	L5	laboratoria	aktywne
0a81c057-c842-4cde-b96b-111f7e1f4cfa	EiAs4	2026-04-01	07:00:00	900	Przerwa świąteczna	Brak	-	Wszystkie grupy	święto	wolne
79289e25-03be-4274-a645-a985cae1df6f	EiAs4	2026-04-02	07:00:00	900	Przerwa świąteczna	Brak	-	Wszystkie grupy	święto	wolne
8aeee46e-6cd9-4bde-bb3e-26ac4f0e7889	EiAs4	2026-04-03	07:00:00	900	Przerwa świąteczna	Brak	-	Wszystkie grupy	święto	wolne
b3b5cbb2-d5b2-43bb-a57f-94f905459fa0	EiAs4	2026-04-04	07:00:00	900	Przerwa świąteczna	Brak	-	Wszystkie grupy	święto	wolne
c91deb2e-543c-4347-8e91-a199a3a32df9	EiAs4	2026-04-05	07:00:00	900	Przerwa świąteczna	Brak	-	Wszystkie grupy	święto	wolne
03abd733-a646-40ce-bafe-3b04e0cecec7	EiAs4	2026-04-06	07:00:00	900	Przerwa świąteczna	Brak	-	Wszystkie grupy	święto	wolne
0188f2e1-2515-4463-9d45-48410d7977e0	EiAs4	2026-04-07	07:00:00	900	Przerwa świąteczna	Brak	-	Wszystkie grupy	święto	wolne
24493ad7-22fe-4e56-b8c9-ffbf3762269f	EiAs4	2026-04-08	08:30:00	90	Język niemiecki	mgr E. Targosz	139SJO	Lek	laboratoria	aktywne
a4fc39ee-49a6-423f-9023-43cb7d2712b2	EiAs4	2026-04-08	10:30:00	120	Wychowanie fizyczne	CSiR	H/C	C	laboratoria	aktywne
776c3cca-bf3a-4c4a-a42f-59e4f36b92df	EiAs4	2026-04-08	12:45:00	90	Technika mikroprocesorowa	dr inż. K. Suchenia	A4	W	wykład	aktywne
42059cad-f60c-4a32-b34a-f398bced0f5e	EiAs4	2026-04-08	14:30:00	90	Maszyny elektryczne	prof. A. Warzecha / dr inż. J. Tulicki	A4	W	wykład	aktywne
f673a923-64d4-441c-a136-afb7755e5205	EiAs4	2026-04-08	16:15:00	90	Układy elektromechaniczne	dr inż. Z. Pilch	A1	W	wykład	aktywne
96964d84-1c8e-480b-9d93-af7d6b7613ff	EiAs4	2026-04-08	18:00:00	90	Układy elektromechaniczne	dr inż. Z. Pilch	12	Lk5	laboratoria	aktywne
d5be3922-35aa-4c22-8a8d-4d7df523b104	EiAs4	2026-04-08	19:45:00	90	Układy elektromechaniczne	dr inż. Z. Pilch	12	Lk6	laboratoria	aktywne
9ab0dcb6-925c-461c-8652-0fc3bfeba51d	EiAs4	2026-04-09	09:15:00	135	Energoelektronika	dr inż. W. Czuchra / mgr inż. M. Wawro	013B	L1	laboratoria	aktywne
54c57911-d46d-4f39-bab4-a0039d478231	EiAs4	2026-04-09	09:15:00	90	Maszyny elektryczne	dr inż. A. Shymanska	A1	Ć3	laboratoria	aktywne
41864be4-3388-4bdb-9260-dbb1b4ab961e	EiAs4	2026-04-09	09:15:00	90	Język angielski	mgr J. Firganek	139SJO	Lek3	laboratoria	aktywne
730694f0-a3d9-4f7d-8146-21bdba4776ab	EiAs4	2026-04-09	09:15:00	90	Podstawy programu Pspice	dr inż. Z. Szular	109B	Lk2	laboratoria	aktywne
6a3231ea-21e6-4552-9721-a738dbcd4175	EiAs4	2026-04-09	11:00:00	90	Podstawy programu Pspice	dr inż. Z. Szular	109B	Lk3	laboratoria	aktywne
09b15529-ccbd-41e4-9f23-9eb46e800302	EiAs4	2026-04-09	11:45:00	135	Energoelektronika	dr inż. W. Czuchra / mgr inż. M. Wawro	013B	L2	laboratoria	aktywne
e64614c4-7184-41a7-8cc4-f32c9ddecae8	EiAs4	2026-04-09	12:30:00	90	Układy elektromechaniczne	dr inż. Z. Pilch	A1	Ć3	laboratoria	aktywne
eaee1bd9-f3a3-4a5d-ae7e-f4e8dd482c88	EiAs4	2026-04-09	12:45:00	90	Podstawy programu Pspice	dr inż. Z. Szular	109B	Lk4	laboratoria	aktywne
38678eaf-ede4-49e5-a0d9-bef7634917f2	EiAs4	2026-04-09	14:15:00	135	Energoelektronika	dr inż. W. Czuchra / mgr inż. M. Wawro	013B	L5	laboratoria	aktywne
493badd9-a298-43b4-9096-432fc14cdf44	EiAs4	2026-04-09	14:15:00	90	Układy elektromechaniczne	dr inż. Z. Pilch	12	Lk1	laboratoria	aktywne
e7027343-c167-4500-855c-ea8544d57894	EiAs4	2026-04-09	16:00:00	90	Układy elektromechaniczne	dr inż. Z. Pilch	12	Lk2	laboratoria	aktywne
28e2d158-2f96-496d-b693-78ccfcbe7f42	EiAs4	2026-04-09	16:45:00	135	Energoelektronika	dr inż. W. Czuchra / mgr inż. M. Wawro	013B	L4	laboratoria	aktywne
8b135db4-c074-4efa-987f-1f7f3354f7fd	EiAs4	2026-04-09	17:45:00	90	Układy elektromechaniczne	dr inż. Z. Pilch	12	Lk4	laboratoria	aktywne
687f0b30-b79e-4fd4-9783-2cbb1725ca25	EiAs4	2026-04-09	19:30:00	90	Układy elektromechaniczne	dr inż. Z. Pilch	12	Lk3	laboratoria	aktywne
0444b5d0-e72e-4344-bec0-db900fd8cb80	EiAs4	2026-04-10	10:00:00	135	Energoelektronika	prof. W. Mazgaj	A4	W	wykład	aktywne
e2874c69-9373-4e90-8154-96c86eb100ce	EiAs4	2026-04-10	12:30:00	90	Energoelektronika	prof. W. Mazgaj	A4	Ć1	laboratoria	aktywne
4d0c5136-b3c4-46a2-8902-cfd05c2ad26f	EiAs4	2026-04-10	12:30:00	90	Układy elektromechaniczne	dr inż. Z. Pilch	10	Ć2	laboratoria	aktywne
f8656781-a420-4f74-b1c7-b3a31d2615fe	EiAs4	2026-04-13	07:30:00	90	Sieci i urządzenia elektryczne	mgr inż. S. Nachman	A4	Ć1	laboratoria	aktywne
b54ab27d-159d-4b56-99cf-3f8c1430899b	EiAs4	2026-04-13	09:15:00	90	Maszyny elektryczne	dr inż. A. Shymanska	10	Ć1	laboratoria	aktywne
c426ca2a-c004-4878-a82d-4af756f5d63f	EiAs4	2026-04-13	09:15:00	90	Technika mikroprocesorowa	mgr inż. M. Raźny	208E	L6	laboratoria	aktywne
3016fc80-9792-4d2c-a187-9bbbe34482ae	EiAs4	2026-04-13	09:15:00	90	Sieci i urządzenia elektryczne	dr inż. T. Sieńko / mgr inż. D. Mamcarz	8	L5	laboratoria	aktywne
986d5e34-b0ba-4136-a222-aa313d8eb0b3	EiAs4	2026-04-13	09:15:00	90	Podstawy programowania w LabVIEW	mgr inż. K. Sołtys	12	Lk6	laboratoria	aktywne
bdef4d0b-7e70-476d-9da1-921b85b78ae0	EiAs4	2026-04-13	11:00:00	90	Maszyny elektryczne	dr inż. A. Shymanska	10	Ć2	laboratoria	aktywne
5f630779-ecf3-4b41-8263-32a5fd9300de	EiAs4	2026-04-13	11:00:00	90	Energoelektronika	mgr inż. M. Wawro	A1	Ć3	laboratoria	aktywne
dbf4d098-6940-4a5c-9f35-b2497434d076	EiAs4	2026-04-13	11:00:00	90	Sieci i urządzenia elektryczne	dr inż. T. Sieńko / mgr inż. D. Mamcarz	8	L3	laboratoria	aktywne
e41b3da6-0b44-48bc-951d-82a9334f3c29	EiAs4	2026-04-13	11:00:00	90	Podstawy programowania w LabVIEW	mgr inż. K. Sołtys	12	Lk1	laboratoria	aktywne
849e594d-764d-432f-a257-044fe6a3b377	EiAs4	2026-04-13	12:45:00	90	Technika mikroprocesorowa	dr inż. S. Żaba	06	L7 / P5	laboratoria	aktywne
67b0f98c-a967-4760-a41a-5b8665979699	EiAs4	2026-04-13	12:45:00	90	Energoelektronika	mgr inż. M. Wawro	A1	Ć2	laboratoria	aktywne
43228a92-266f-4f20-ba09-fab79def6181	EiAs4	2026-04-13	12:45:00	90	Podstawy programowania w LabVIEW	dr inż. T. Makowski / mgr inż. J. Zielonka	WA2	L2	laboratoria	aktywne
f99debc1-3642-4cb4-8902-21cdedb49afd	EiAs4	2026-04-13	14:30:00	90	Podstawy programowania w LabVIEW	dr inż. T. Makowski / mgr inż. J. Zielonka	WA2	L7	laboratoria	aktywne
6fefaf6a-b95f-4bb6-bde3-659f84796039	EiAs4	2026-04-13	14:30:00	90	Podstawy programowania w LabVIEW	mgr inż. K. Sołtys	12	Lk3	laboratoria	aktywne
a3b3fa6e-fbf0-4e26-bb9c-ac68820bbedd	EiAs4	2026-04-13	16:15:00	90	Podstawy programowania w LabVIEW	dr inż. T. Makowski / mgr inż. J. Zielonka	WA2	L4	laboratoria	aktywne
a469b9b5-e571-477d-b253-99afda435449	EiAs4	2026-04-13	16:15:00	90	Podstawy programowania w LabVIEW	mgr inż. K. Sołtys	12	Lk4	laboratoria	aktywne
f862800d-3e92-4df3-b2d0-1ba14a64fefa	EiAs4	2026-04-13	18:00:00	90	Podstawy programowania w LabVIEW	dr inż. T. Makowski / mgr inż. J. Zielonka	WA2	L6	laboratoria	aktywne
e90b7953-dad2-4b1c-a2cc-59be25b2f13f	EiAs4	2026-04-13	19:45:00	90	Technika mikroprocesorowa	dr inż. A. Drwal	06	L8 / P6	laboratoria	aktywne
f237ddab-cae0-42a4-8774-dbeef6cc3e39	EiAs4	2026-04-14	09:15:00	90	Maszyny elektryczne	dr inż. J. Tulicki / mgr inż. P. Oziębło	01A / 01B	L1 / L2	laboratoria	aktywne
0dad6d13-5286-4787-ad0a-819dc0cd8be8	EiAs4	2026-04-14	09:15:00	90	Technika mikroprocesorowa	dr inż. K. Suchenia	208E	L3	laboratoria	aktywne
e5289634-7890-41c5-b150-a613b8072681	EiAs4	2026-04-14	09:15:00	90	Sieci i urządzenia elektryczne	dr inż. T. Sieńko	A1	Ć3	laboratoria	aktywne
18e52cd8-c0a1-455d-a727-b8be5020207f	EiAs4	2026-04-14	11:00:00	90	Maszyny elektryczne	dr inż. M. Sierżęga / mgr inż. T. Gębarowski	01A / 01B	L3 / L4	laboratoria	aktywne
3e5c07e1-1cad-4005-9ad2-4151e32e1761	EiAs4	2026-04-14	11:00:00	90	Technika mikroprocesorowa	dr inż. K. Suchenia	208E	L1	laboratoria	aktywne
d02214cf-b4ea-4b9d-b483-eecd9f559ebb	EiAs4	2026-04-14	11:00:00	90	Język angielski	mgr J. Firganek	136SJO	Lek4	laboratoria	aktywne
bd8f38c8-8964-4927-8fae-309dcbb14a01	EiAs4	2026-04-14	11:00:00	90	Sieci i urządzenia elektryczne	dr inż. T. Sieńko / mgr inż. D. Mamcarz	8	L6	laboratoria	aktywne
ae66acf0-b8a5-486e-a9b2-4fd8d3749353	EiAs4	2026-04-14	12:45:00	90	Maszyny elektryczne	dr inż. J. Tulicki / mgr inż. T. Gębarowski	01A / 01B	L5 / L6	laboratoria	aktywne
9b2181c4-13c5-4083-a7c8-3dfd3c967466	EiAs4	2026-04-14	12:45:00	90	Technika mikroprocesorowa	dr inż. K. Suchenia	208E	L4	laboratoria	aktywne
ef41db54-bf11-4f02-894e-beadde4f3f07	EiAs4	2026-04-14	12:45:00	90	Język angielski	mgr J. Firganek	139SJO	Lek1	laboratoria	aktywne
1df39c78-c5c8-4ab3-9354-e9572e7fcc1e	EiAs4	2026-04-14	12:45:00	90	Sieci i urządzenia elektryczne	dr inż. T. Sieńko / mgr inż. D. Mamcarz	8	L8	laboratoria	aktywne
9fd9bff8-745f-41b8-a053-132badc06684	EiAs4	2026-04-14	14:30:00	90	Maszyny elektryczne	dr inż. J. Tulicki / dr inż. M. Sierżęga	01A / 01B	L7 / L8	laboratoria	aktywne
8b944fa1-08fd-4d0b-88d7-7459f3cac911	EiAs4	2026-04-14	14:30:00	90	Technika mikroprocesorowa	dr inż. K. Suchenia	208E	L2	laboratoria	aktywne
814bd8f9-3005-4bba-9041-861c32bcd1db	EiAs4	2026-04-14	14:30:00	90	Język angielski	mgr J. Firganek	139SJO	Lek2	laboratoria	aktywne
83a49b90-95ca-4c09-a525-993b4a1e9dea	EiAs4	2026-04-14	16:15:00	90	Technika mikroprocesorowa	dr inż. K. Suchenia	208E	L5	laboratoria	aktywne
324d6e18-acb1-4f40-9904-5363a6b1ff9e	EiAs4	2026-04-15	08:30:00	90	Język niemiecki	mgr E. Targosz	139SJO	Lek	laboratoria	aktywne
f8904235-5652-47b6-b3c7-a74367ffadea	EiAs4	2026-04-15	10:30:00	120	Wychowanie fizyczne	CSiR	H/C	C	laboratoria	aktywne
29830537-26b3-4803-83ca-d93962168cb9	EiAs4	2026-04-15	12:45:00	90	Technika mikroprocesorowa	dr inż. K. Suchenia	A4	W	wykład	aktywne
33b04ff9-2b93-49ec-afde-9f58d93065fd	EiAs4	2026-04-15	14:30:00	90	Maszyny elektryczne	prof. A. Warzecha / dr inż. J. Tulicki	A4	W	wykład	aktywne
a0bc1662-17d0-4691-b185-3d46cc0dd4e2	EiAs4	2026-04-15	16:15:00	90	Układy elektromechaniczne	dr inż. Z. Pilch	A1	W	wykład	aktywne
73036b43-326d-4bf6-b693-dff2b841852e	EiAs4	2026-04-15	18:00:00	90	Układy elektromechaniczne	dr inż. Z. Pilch	12	P5	laboratoria	aktywne
128c5c70-b9ef-42c7-830c-629efb87cfbd	EiAs4	2026-04-15	19:45:00	90	Układy elektromechaniczne	dr inż. Z. Pilch	12	P6	laboratoria	aktywne
84078a47-382a-4643-bf2a-18eec1c39293	EiAs4	2026-04-16	09:15:00	135	Energoelektronika	dr inż. W. Czuchra / mgr inż. M. Wawro	013B	L3	laboratoria	aktywne
d406e0bf-d3e2-4f6c-abef-94f597785751	EiAs4	2026-04-16	09:15:00	90	Maszyny elektryczne	dr inż. A. Shymanska	A1	Ć3	laboratoria	aktywne
6604f401-8930-47e1-a3f5-6c874de8a6a5	EiAs4	2026-04-16	09:15:00	90	Język angielski	mgr J. Firganek	139SJO	Lek3	laboratoria	aktywne
8743564c-9964-4723-a851-0efdf68de9ec	EiAs4	2026-04-16	09:15:00	90	Podstawy programu Pspice	dr inż. Z. Szular	109B	Lk1	laboratoria	aktywne
d30b9e50-6eda-43dd-b47f-feb0bd8f7d9a	EiAs4	2026-04-16	11:00:00	90	Podstawy programu Pspice	dr inż. Z. Szular	109B	Lk6	laboratoria	aktywne
4b66f239-f68a-424c-9480-d7a26255c2b7	EiAs4	2026-04-16	11:45:00	135	Energoelektronika	dr inż. W. Czuchra / mgr inż. M. Wawro	013B	L6	laboratoria	aktywne
2fef54d0-454c-412c-8b4c-c251b79d4743	EiAs4	2026-04-16	12:30:00	90	Układy elektromechaniczne	dr inż. Z. Pilch	A1	Ć1	laboratoria	aktywne
8f760e72-f933-49d4-8eea-d18066281978	EiAs4	2026-04-16	12:45:00	90	Podstawy programu Pspice	dr inż. Z. Szular	109B	Lk5	laboratoria	aktywne
e9af7651-04cd-4b23-a48b-a72189e33289	EiAs4	2026-06-05	07:00:00	900	Boże Ciało	Brak	-	Wszystkie grupy	święto	wolne
4caf2fc1-8021-48c6-9b82-f0f25b936e51	EiAs4	2026-04-16	14:15:00	135	Energoelektronika	dr inż. W. Czuchra / mgr inż. M. Wawro	013B	L7	laboratoria	aktywne
b516a16f-08be-448c-b526-a8e1af3ffc54	EiAs4	2026-04-16	14:15:00	90	Układy elektromechaniczne	dr inż. Z. Pilch	12	P1	laboratoria	aktywne
c0284f36-26b0-4700-8288-08ad892fd4a0	EiAs4	2026-04-16	16:00:00	90	Układy elektromechaniczne	dr inż. Z. Pilch	12	P3	laboratoria	aktywne
1bc5fb35-30a8-4095-98a3-89cf73b25697	EiAs4	2026-04-16	16:45:00	135	Energoelektronika	dr inż. W. Czuchra / mgr inż. M. Wawro	013B	L8	laboratoria	aktywne
09997006-2ab8-44df-bcdf-2aa323f84df8	EiAs4	2026-04-16	17:45:00	90	Układy elektromechaniczne	dr inż. Z. Pilch	12	P2	laboratoria	aktywne
06e32fdb-c7cd-4edd-a000-dd8f4115d80b	EiAs4	2026-04-16	19:30:00	90	Układy elektromechaniczne	dr inż. Z. Pilch	12	P4	laboratoria	aktywne
029359f0-8824-4cd7-9b39-d1569597f3b4	EiAs4	2026-04-17	10:00:00	135	Energoelektronika	prof. W. Mazgaj	A4	W	wykład	aktywne
5e38245c-9151-4cab-a585-c40a3ecc993a	EiAs4	2026-04-17	12:30:00	90	Energoelektronika	prof. W. Mazgaj	A4	Ć1	laboratoria	aktywne
1c4541bb-813b-426e-914a-1f80cf3697fa	EiAs4	2026-04-20	07:30:00	90	Sieci i urządzenia elektryczne	dr inż. T. Sieńko	A4	W	wykład	aktywne
04d05637-6035-4e97-975a-28e62171138c	EiAs4	2026-04-20	09:15:00	90	Maszyny elektryczne	dr inż. A. Shymanska	10	Ć1	laboratoria	aktywne
5331929e-e3ba-41c8-9335-6117b85d6fdb	EiAs4	2026-04-20	09:15:00	90	Technika mikroprocesorowa	mgr inż. M. Raźny	208E	L6	laboratoria	aktywne
19214357-48a3-4568-9490-1846d7a2d7f1	EiAs4	2026-04-20	09:15:00	90	Sieci i urządzenia elektryczne	dr inż. T. Sieńko / mgr inż. D. Mamcarz	8	L4	laboratoria	aktywne
5aff811a-b8d6-4a76-9928-efb12c4f17c1	EiAs4	2026-04-20	09:15:00	90	Podstawy programowania w LabVIEW	mgr inż. K. Sołtys	12	Lk5	laboratoria	aktywne
7bb28622-055e-4311-9032-3f8026a2bc54	EiAs4	2026-04-20	11:00:00	90	Maszyny elektryczne	dr inż. A. Shymanska	10	Ć2	laboratoria	aktywne
b4505c58-a4be-4e53-90bd-b89557864076	EiAs4	2026-04-20	11:00:00	90	Energoelektronika	mgr inż. M. Wawro	A1	Ć3	laboratoria	aktywne
4ac366e5-ea7c-4ee9-a457-fab243fc7522	EiAs4	2026-04-20	11:00:00	90	Sieci i urządzenia elektryczne	dr inż. T. Sieńko / mgr inż. D. Mamcarz	8	L1	laboratoria	aktywne
abe65260-7061-41b7-9f35-ca4a6e15aee7	EiAs4	2026-04-20	11:00:00	90	Podstawy programowania w LabVIEW	mgr inż. K. Sołtys	12	Lk2	laboratoria	aktywne
2d143d77-74c5-46c5-abc7-77f9cab0b7f0	EiAs4	2026-04-20	12:45:00	90	Technika mikroprocesorowa	dr inż. S. Żaba	06	L7 / P5	laboratoria	aktywne
beaff339-abb3-498b-9fe8-7203649dbe1e	EiAs4	2026-04-20	12:45:00	90	Energoelektronika	mgr inż. M. Wawro	A1	Ć2	laboratoria	aktywne
f2c2f8c3-d03b-4bb7-88a4-8c9109c6c7f3	EiAs4	2026-04-20	12:45:00	90	Podstawy programowania w LabVIEW	dr inż. T. Makowski / mgr inż. J. Zielonka	WA2	L1	laboratoria	aktywne
eb42b1fd-8069-4439-855a-5afcc7bff8a1	EiAs4	2026-04-20	14:30:00	90	Podstawy programowania w LabVIEW	dr inż. T. Makowski	A3	W	wykład	aktywne
99ee5b30-2a4f-47b2-82fd-59fd0b09637f	EiAs4	2026-04-20	16:15:00	90	Podstawy programowania w LabVIEW	dr inż. T. Makowski / mgr inż. J. Zielonka	WA2	L3	laboratoria	aktywne
e23f497d-0814-4b64-96be-3380d49ada53	EiAs4	2026-04-20	18:00:00	90	Podstawy programowania w LabVIEW	dr inż. T. Makowski / mgr inż. J. Zielonka	WA2	L5	laboratoria	aktywne
9d599f79-f783-40a6-9b1f-97edd20e1c42	EiAs4	2026-04-20	19:45:00	90	Technika mikroprocesorowa	dr inż. A. Drwal	06	L8 / P6	laboratoria	aktywne
cc759d36-2923-4f11-9782-143e98a31137	EiAs4	2026-04-21	09:15:00	90	Maszyny elektryczne	dr inż. J. Tulicki / mgr inż. P. Oziębło	01A / 01B	L1 / L2	laboratoria	aktywne
136d2322-c9a9-43ed-9d6b-31f7f7da22b9	EiAs4	2026-04-21	09:15:00	90	Technika mikroprocesorowa	dr inż. K. Suchenia	208E	L3	laboratoria	aktywne
1766fa01-9e17-4de3-a9f7-10c9a6578dc2	EiAs4	2026-04-21	09:15:00	90	Sieci i urządzenia elektryczne	dr inż. T. Sieńko	A1	Ć2	laboratoria	aktywne
18e48f3d-ff8a-4ea3-9002-87b9132bf5ae	EiAs4	2026-04-21	11:00:00	90	Maszyny elektryczne	dr inż. M. Sierżęga / mgr inż. T. Gębarowski	01A / 01B	L3 / L4	laboratoria	aktywne
167113e2-eabe-4e42-aa8c-8fa59d586d79	EiAs4	2026-04-21	11:00:00	90	Technika mikroprocesorowa	dr inż. K. Suchenia	208E	L1	laboratoria	aktywne
83ebce73-aa4d-4aef-bee2-f2ba1581cb36	EiAs4	2026-04-21	11:00:00	90	Język angielski	mgr J. Firganek	136SJO	Lek4	laboratoria	aktywne
7574a367-f25a-4dd6-a986-d26250643067	EiAs4	2026-04-21	11:00:00	90	Sieci i urządzenia elektryczne	dr inż. T. Sieńko / mgr inż. D. Mamcarz	8	L2	laboratoria	aktywne
d00bb26a-f80b-41c6-9883-33390473eff8	EiAs4	2026-04-21	12:45:00	90	Maszyny elektryczne	dr inż. J. Tulicki / mgr inż. T. Gębarowski	01A / 01B	L5 / L6	laboratoria	aktywne
b114d72f-699e-4554-9706-6a54737d9570	EiAs4	2026-04-21	12:45:00	90	Technika mikroprocesorowa	dr inż. K. Suchenia	208E	L4	laboratoria	aktywne
94707623-5a7d-4d08-b772-c61231c165d5	EiAs4	2026-04-21	12:45:00	90	Język angielski	mgr J. Firganek	139SJO	Lek1	laboratoria	aktywne
bd5f3af2-fc2f-40bd-96bf-9678d024a81b	EiAs4	2026-04-21	12:45:00	90	Sieci i urządzenia elektryczne	dr inż. T. Sieńko / mgr inż. D. Mamcarz	8	L7	laboratoria	aktywne
712e0147-a181-4c87-8692-7f7c0b1645eb	EiAs4	2026-04-21	14:30:00	90	Maszyny elektryczne	dr inż. J. Tulicki / dr inż. M. Sierżęga	01A / 01B	L7 / L8	laboratoria	aktywne
509715f3-54a0-481b-9eaa-ddb93eb98718	EiAs4	2026-04-21	14:30:00	90	Technika mikroprocesorowa	dr inż. K. Suchenia	208E	L2	laboratoria	aktywne
299f6fe3-5861-41bf-87fd-69b506cc9a46	EiAs4	2026-04-21	14:30:00	90	Język angielski	mgr J. Firganek	139SJO	Lek2	laboratoria	aktywne
4a061861-063d-4498-9ae7-ea246f3f46b4	EiAs4	2026-04-21	16:15:00	90	Technika mikroprocesorowa	dr inż. K. Suchenia	208E	L5	laboratoria	aktywne
d587dc4e-e667-49a8-81e8-e9498c60bf85	EiAs4	2026-04-21	16:15:00	90	Podstawy programowania w LabVIEW	dr inż. T. Makowski / mgr inż. J. Zielonka	WA2	L8	laboratoria	aktywne
f2656882-fd5f-416e-9a32-dd7cb9736df6	EiAs4	2026-04-22	08:30:00	90	Język niemiecki	mgr E. Targosz	139SJO	Lek	laboratoria	aktywne
93aa08c3-4c01-4d65-aa0e-665971c88a05	EiAs4	2026-04-22	10:30:00	120	Wychowanie fizyczne	CSiR	H/C	C	laboratoria	aktywne
60f42d96-3588-49ee-935c-d5eab1b0f383	EiAs4	2026-04-22	12:45:00	90	Technika mikroprocesorowa	dr inż. K. Suchenia	A4	W	wykład	aktywne
08bf45ce-4eec-46bc-a9d9-466f96c9852b	EiAs4	2026-04-22	14:30:00	90	Maszyny elektryczne	prof. A. Warzecha / dr inż. J. Tulicki	A4	W	wykład	aktywne
9fde94dd-9c68-4a50-a9f5-8cca7655c555	EiAs4	2026-04-22	16:15:00	90	Układy elektromechaniczne	dr inż. Z. Pilch	A1	W	wykład	aktywne
faad842f-07cc-4877-a746-282bbde53080	EiAs4	2026-04-22	18:00:00	90	Układy elektromechaniczne	dr inż. Z. Pilch	12	Lk5	laboratoria	aktywne
93fa80a8-017b-418d-9da1-81eac1d70c19	EiAs4	2026-04-22	19:45:00	90	Układy elektromechaniczne	dr inż. Z. Pilch	12	Lk6	laboratoria	aktywne
a65e9ae2-d546-4a25-838a-f8d3d5ec0d4b	EiAs4	2026-04-23	09:15:00	135	Energoelektronika	dr inż. W. Czuchra / mgr inż. M. Wawro	013B	L1	laboratoria	aktywne
71c2d6a5-593c-4713-ae89-c8c2a981191f	EiAs4	2026-04-23	09:15:00	90	Maszyny elektryczne	dr inż. A. Shymanska	A1	Ć3	laboratoria	aktywne
6fd54569-cbc3-4a24-8017-01f71770e75d	EiAs4	2026-04-23	09:15:00	90	Język angielski	mgr J. Firganek	139SJO	Lek3	laboratoria	aktywne
d1634099-e2ce-47e3-8a61-2ef60a820932	EiAs4	2026-04-23	09:15:00	90	Podstawy programu Pspice	dr inż. Z. Szular	109B	Lk2	laboratoria	aktywne
040597af-9fd5-4487-8bf3-cbe3b05b6747	EiAs4	2026-04-23	11:00:00	90	Podstawy programu Pspice	dr inż. Z. Szular	109B	Lk3	laboratoria	aktywne
6ddb34ba-075d-47e4-a1be-df07bdcee2f3	EIAs6I	2026-04-04	07:00:00	900	Przerwa świąteczna	Brak	-	Wszystkie grupy	święto	wolne
919d79f5-23b2-4126-a171-063999f61c29	EiAs4	2026-04-23	11:45:00	135	Energoelektronika	dr inż. W. Czuchra / mgr inż. M. Wawro	013B	L2	laboratoria	aktywne
d8fa3204-c77b-4d1a-9501-6bb3f38d313b	EiAs4	2026-04-23	12:30:00	90	Układy elektromechaniczne	dr inż. Z. Pilch	A1	Ć3	laboratoria	aktywne
d0aec3de-7e56-44f3-a4f8-0d30422fd9ed	EiAs4	2026-04-23	12:45:00	90	Podstawy programu Pspice	dr inż. Z. Szular	109B	Lk4	laboratoria	aktywne
2fcbe48c-e2a9-42e0-83cc-0eee4b3bb6b7	EiAs4	2026-04-23	14:15:00	135	Energoelektronika	dr inż. W. Czuchra / mgr inż. M. Wawro	013B	L5	laboratoria	aktywne
b1045ad8-c683-493d-a1c0-10b04defa546	EiAs4	2026-04-23	14:15:00	90	Układy elektromechaniczne	dr inż. Z. Pilch	12	Lk1	laboratoria	aktywne
bb335a94-0335-482b-8612-3e4791345103	EiAs4	2026-04-23	16:00:00	90	Układy elektromechaniczne	dr inż. Z. Pilch	12	Lk2	laboratoria	aktywne
5fae6a03-87fa-4bb1-9f93-7e39a2c7c7eb	EiAs4	2026-04-23	16:45:00	135	Energoelektronika	dr inż. W. Czuchra / mgr inż. M. Wawro	013B	L4	laboratoria	aktywne
369291f6-2fa1-4bd8-a87a-1f3ba22956f5	EiAs4	2026-04-23	17:45:00	90	Układy elektromechaniczne	dr inż. Z. Pilch	12	Lk4	laboratoria	aktywne
464afa0d-7694-4b5b-bb6c-e09e28db9fd7	EiAs4	2026-04-23	19:30:00	90	Układy elektromechaniczne	dr inż. Z. Pilch	12	Lk3	laboratoria	aktywne
581bcc57-e349-4c80-a760-25264fa267b1	EiAs4	2026-04-24	10:00:00	135	Energoelektronika	prof. W. Mazgaj	A4	W	wykład	aktywne
73e40456-70b5-432e-9489-4721b1aec833	EiAs4	2026-04-24	12:30:00	90	Energoelektronika	prof. W. Mazgaj	A4	Ć1	laboratoria	aktywne
6835ad08-9293-490e-9df4-844d99dfa633	EiAs4	2026-04-24	12:30:00	90	Układy elektromechaniczne	dr inż. Z. Pilch	10	Ć2	laboratoria	aktywne
ee59afd1-e553-4da5-843e-12677d56102c	EiAs4	2026-04-27	07:30:00	90	Sieci i urządzenia elektryczne	mgr inż. S. Nachman	A4	Ć1	laboratoria	aktywne
f2743f45-861c-4c9e-bb3b-4f4f26e16bd8	EiAs4	2026-04-27	09:15:00	90	Maszyny elektryczne	dr inż. A. Shymanska	10	Ć1	laboratoria	aktywne
5e3a91b8-319a-466d-bdd4-6f7a903ab527	EiAs4	2026-04-27	09:15:00	90	Technika mikroprocesorowa	mgr inż. M. Raźny	208E	L6	laboratoria	aktywne
56edefa7-e9ab-471f-9531-b551172c5f1f	EiAs4	2026-04-27	09:15:00	90	Sieci i urządzenia elektryczne	dr inż. T. Sieńko / mgr inż. D. Mamcarz	8	L5	laboratoria	aktywne
57624b97-0028-4070-91d0-73b28f7abfb8	EiAs4	2026-04-27	09:15:00	90	Podstawy programowania w LabVIEW	mgr inż. K. Sołtys	12	Lk6	laboratoria	aktywne
44d4d30b-6373-4550-a81a-53252e6fd2e5	EiAs4	2026-04-27	11:00:00	90	Maszyny elektryczne	dr inż. A. Shymanska	10	Ć2	laboratoria	aktywne
4036695c-e792-4009-9b95-177abe0cc796	EiAs4	2026-04-27	11:00:00	90	Energoelektronika	mgr inż. M. Wawro	A1	Ć3	laboratoria	aktywne
5bb2f054-55ae-4c68-9f3d-f2b5ffb2e3c1	EiAs4	2026-04-27	11:00:00	90	Sieci i urządzenia elektryczne	dr inż. T. Sieńko / mgr inż. D. Mamcarz	8	L3	laboratoria	aktywne
670590c0-d82a-4f21-a16a-bbba4ff48335	EiAs4	2026-04-27	11:00:00	90	Podstawy programowania w LabVIEW	mgr inż. K. Sołtys	12	Lk1	laboratoria	aktywne
da116af7-b54f-4f34-b52a-1f1c6fbb0fdd	EiAs4	2026-04-27	12:45:00	90	Technika mikroprocesorowa	dr inż. S. Żaba	06	L7 / P5	laboratoria	aktywne
937900b3-5f10-4c8b-aa1d-c9d754825d75	EiAs4	2026-04-27	12:45:00	90	Energoelektronika	mgr inż. M. Wawro	A1	Ć2	laboratoria	aktywne
5abf47d7-9382-4215-8ba9-8abf9235e5c0	EiAs4	2026-04-27	12:45:00	90	Podstawy programowania w LabVIEW	dr inż. T. Makowski / mgr inż. J. Zielonka	WA2	L2	laboratoria	aktywne
49761032-3c16-4f20-9ee5-0b38506c267e	EiAs4	2026-04-27	14:30:00	90	Podstawy programowania w LabVIEW	dr inż. T. Makowski / mgr inż. J. Zielonka	WA2	L7	laboratoria	aktywne
1a45e7fa-c3eb-4ff7-83d5-9992bda46648	EiAs4	2026-04-27	14:30:00	90	Podstawy programowania w LabVIEW	mgr inż. K. Sołtys	12	Lk3	laboratoria	aktywne
b8498499-d3ba-473e-85ce-0eddf8703f68	EiAs4	2026-04-27	16:15:00	90	Podstawy programowania w LabVIEW	dr inż. T. Makowski / mgr inż. J. Zielonka	WA2	L4	laboratoria	aktywne
800f05e4-4c8c-49fe-b478-535348d5aeee	EiAs4	2026-04-27	16:15:00	90	Podstawy programowania w LabVIEW	mgr inż. K. Sołtys	12	Lk4	laboratoria	aktywne
46850ec1-fe0d-41dd-ba66-2ad389a36721	EiAs4	2026-04-27	18:00:00	90	Podstawy programowania w LabVIEW	dr inż. T. Makowski / mgr inż. J. Zielonka	WA2	L6	laboratoria	aktywne
fd2b5615-ad95-47f4-ac3f-2e0210f49c86	EiAs4	2026-04-27	19:45:00	90	Technika mikroprocesorowa	dr inż. A. Drwal	06	L8 / P6	laboratoria	aktywne
dd433c24-2113-4da1-a5ca-2f21c46c68ca	EiAs4	2026-04-28	09:15:00	90	Maszyny elektryczne	dr inż. J. Tulicki / mgr inż. P. Oziębło	01A / 01B	L1 / L2	laboratoria	aktywne
b9f2f029-1b14-4668-8bdc-65f4eaf35af5	EiAs4	2026-04-28	09:15:00	90	Technika mikroprocesorowa	dr inż. K. Suchenia	208E	L3	laboratoria	aktywne
05c415ba-50af-415a-9fa7-f23d6ace85fc	EiAs4	2026-04-28	09:15:00	90	Sieci i urządzenia elektryczne	dr inż. T. Sieńko	A1	Ć3	laboratoria	aktywne
05a20f3b-11e0-4170-93e2-4dcf2de7a81c	EiAs4	2026-04-28	11:00:00	90	Maszyny elektryczne	dr inż. M. Sierżęga / mgr inż. T. Gębarowski	01A / 01B	L3 / L4	laboratoria	aktywne
85ba70da-2bb6-4cab-aa77-f23b6d220a92	EiAs4	2026-04-28	11:00:00	90	Technika mikroprocesorowa	dr inż. K. Suchenia	208E	L1	laboratoria	aktywne
82a015f5-b20c-4854-9e30-6b6211f7238f	EiAs4	2026-04-28	11:00:00	90	Język angielski	mgr J. Firganek	136SJO	Lek4	laboratoria	aktywne
df0cc337-803b-41d8-bc8c-c8fada52a6c6	EiAs4	2026-04-28	11:00:00	90	Sieci i urządzenia elektryczne	dr inż. T. Sieńko / mgr inż. D. Mamcarz	8	L6	laboratoria	aktywne
6f57d305-c179-4248-bac8-8edb07f1320a	EiAs4	2026-04-28	12:45:00	90	Maszyny elektryczne	dr inż. J. Tulicki / mgr inż. T. Gębarowski	01A / 01B	L5 / L6	laboratoria	aktywne
fc933177-0a7d-45e1-a29c-3f12697bbb8b	EiAs4	2026-04-28	12:45:00	90	Technika mikroprocesorowa	dr inż. K. Suchenia	208E	L4	laboratoria	aktywne
f1a9f6c0-73b9-4936-851c-dd7803df512b	EiAs4	2026-04-28	12:45:00	90	Język angielski	mgr J. Firganek	139SJO	Lek1	laboratoria	aktywne
fe10b668-c82b-4968-ae9b-b1256d2d3a6c	EiAs4	2026-04-28	12:45:00	90	Sieci i urządzenia elektryczne	dr inż. T. Sieńko / mgr inż. D. Mamcarz	8	L8	laboratoria	aktywne
8f7c46b8-8fb9-49b8-986f-318be585e0ca	EiAs4	2026-04-28	14:30:00	90	Maszyny elektryczne	dr inż. J. Tulicki / dr inż. M. Sierżęga	01A / 01B	L7 / L8	laboratoria	aktywne
f1785bdf-d245-4724-8875-d2ba4e01b5f0	EiAs4	2026-04-28	14:30:00	90	Technika mikroprocesorowa	dr inż. K. Suchenia	208E	L2	laboratoria	aktywne
6b4cb8b3-d88c-43d2-af5a-9436e2f3e24a	EiAs4	2026-04-28	14:30:00	90	Język angielski	mgr J. Firganek	139SJO	Lek2	laboratoria	aktywne
241e4abc-f925-4558-9c66-629e686376a7	EiAs4	2026-04-28	16:15:00	90	Technika mikroprocesorowa	dr inż. K. Suchenia	208E	L5	laboratoria	aktywne
de4f2396-3fac-400c-8c9e-bdd44f37b9e3	EiAs4	2026-04-29	08:30:00	90	Język niemiecki	mgr E. Targosz	139SJO	Lek	laboratoria	aktywne
be063d2c-27cd-466d-ae4f-3b0908e22320	EiAs4	2026-04-29	10:30:00	120	Wychowanie fizyczne	CSiR	H/C	C	laboratoria	aktywne
51e5cb50-a7c8-49c9-939f-ea5844a5ce19	EiAs4	2026-04-29	12:45:00	90	Technika mikroprocesorowa	dr inż. K. Suchenia	A4	W	wykład	aktywne
575c7f21-20cb-4a79-aba6-1d6fbbfffdf2	EiAs4	2026-04-29	14:30:00	90	Maszyny elektryczne	prof. A. Warzecha / dr inż. J. Tulicki	A4	W	wykład	aktywne
4aa7e779-b355-4106-8b62-fa31ee04eed8	EiAs4	2026-04-29	16:15:00	90	Układy elektromechaniczne	dr inż. Z. Pilch	A1	W	wykład	aktywne
7a22504d-e7e8-4fb2-9140-cc487cf4982f	EiAs4	2026-04-29	18:00:00	90	Układy elektromechaniczne	dr inż. Z. Pilch	12	P5	laboratoria	aktywne
80691e5d-4649-46ac-a722-7f7e7f8ab170	EiAs4	2026-04-29	19:45:00	90	Układy elektromechaniczne	dr inż. Z. Pilch	12	P6	laboratoria	aktywne
680d3dbf-07c2-4b50-a46a-c1c097bd2bc0	EiAs4	2026-04-30	09:15:00	135	Energoelektronika	dr inż. W. Czuchra / mgr inż. M. Wawro	013B	L3	laboratoria	aktywne
2b217ad5-7c57-4229-a67c-da8bc0700b11	EiAs4	2026-04-30	09:15:00	90	Maszyny elektryczne	dr inż. A. Shymanska	A1	Ć3	laboratoria	aktywne
684dccf2-5e92-4423-8684-201b3cbbc475	EiAs4	2026-04-30	09:15:00	90	Język angielski	mgr J. Firganek	139SJO	Lek3	laboratoria	aktywne
3be23e10-9ce5-44f5-a2ee-a58ff98c1b65	EiAs4	2026-04-30	09:15:00	90	Podstawy programu Pspice	dr inż. Z. Szular	109B	Lk1	laboratoria	aktywne
0c025f9b-f357-446f-bba1-1b3a97cadcc5	EiAs4	2026-04-30	11:00:00	90	Podstawy programu Pspice	dr inż. Z. Szular	109B	Lk6	laboratoria	aktywne
2a52c10f-fe4b-4673-86b0-2e140cc26d1d	EiAs4	2026-04-30	11:45:00	135	Energoelektronika	dr inż. W. Czuchra / mgr inż. M. Wawro	013B	L6	laboratoria	aktywne
0dca9e1b-a218-4670-af1a-1bbcd96dcc81	EiAs4	2026-04-30	12:30:00	90	Układy elektromechaniczne	dr inż. Z. Pilch	A1	Ć1	laboratoria	aktywne
9a142e6d-ad20-4e34-b26d-a7f7486f24ff	EiAs4	2026-04-30	12:45:00	90	Podstawy programu Pspice	dr inż. Z. Szular	109B	Lk5	laboratoria	aktywne
c293a7d5-817e-4c30-870b-d0cb0a94964a	EiAs4	2026-04-30	14:15:00	135	Energoelektronika	dr inż. W. Czuchra / mgr inż. M. Wawro	013B	L7	laboratoria	aktywne
08467912-325c-41f3-bb3e-46861f1a7271	EiAs4	2026-04-30	14:15:00	90	Układy elektromechaniczne	dr inż. Z. Pilch	12	P1	laboratoria	aktywne
b42aec9b-e3d0-46be-afea-8f7d77cbe620	EiAs4	2026-04-30	16:00:00	90	Układy elektromechaniczne	dr inż. Z. Pilch	12	P3	laboratoria	aktywne
2cff57b1-8bb7-4628-b81e-4a9966ae534a	EiAs4	2026-04-30	16:45:00	135	Energoelektronika	dr inż. W. Czuchra / mgr inż. M. Wawro	013B	L8	laboratoria	aktywne
9c582cf2-8311-4de4-923a-1e5e5aa57329	EiAs4	2026-04-30	17:45:00	90	Układy elektromechaniczne	dr inż. Z. Pilch	12	P2	laboratoria	aktywne
8262b92b-a649-4eb1-80fd-a5a3997dea16	EiAs4	2026-04-30	19:30:00	90	Układy elektromechaniczne	dr inż. Z. Pilch	12	P4	laboratoria	aktywne
ed070569-111c-49a3-8a33-d0653f24d6fd	EiAs4	2026-05-01	07:00:00	900	Majówka	Brak	-	Wszystkie grupy	święto	wolne
49b9f4e0-a330-49bc-ac54-a8466030e598	EiAs4	2026-05-02	07:00:00	900	Majówka	Brak	-	Wszystkie grupy	święto	wolne
31cbbb70-f6d2-41ca-99a9-cd78fed9c0c4	EiAs4	2026-05-03	07:00:00	900	Majówka	Brak	-	Wszystkie grupy	święto	wolne
bcb3ad02-3818-4cc3-8a4a-00a252b04091	EiAs4	2026-05-04	07:00:00	900	Majówka	Brak	-	Wszystkie grupy	święto	wolne
69e72995-80d1-4daa-8ab3-735343b67469	EiAs4	2026-05-05	09:15:00	90	Maszyny elektryczne	dr inż. J. Tulicki / mgr inż. P. Oziębło	01A / 01B	L1 / L2	laboratoria	aktywne
f16a5c52-2f8a-4115-95aa-c07d1f62e843	EiAs4	2026-05-05	09:15:00	90	Technika mikroprocesorowa	dr inż. K. Suchenia	208E	L3	laboratoria	aktywne
2cf18887-e137-4fe8-9af1-0b6d52272ede	EiAs4	2026-05-05	09:15:00	90	Sieci i urządzenia elektryczne	dr inż. T. Sieńko	A1	Ć2	laboratoria	aktywne
1c716da2-5cd2-4572-aad2-3d3d188c1907	EiAs4	2026-05-05	11:00:00	90	Maszyny elektryczne	dr inż. M. Sierżęga / mgr inż. T. Gębarowski	01A / 01B	L3 / L4	laboratoria	aktywne
9d0bb844-25f1-472c-b22a-c146f1f425eb	EiAs4	2026-05-05	11:00:00	90	Technika mikroprocesorowa	dr inż. K. Suchenia	208E	L1	laboratoria	aktywne
838ea026-afaf-41c7-8459-ddffd4efa6bf	EiAs4	2026-05-05	11:00:00	90	Język angielski	mgr J. Firganek	136SJO	Lek4	laboratoria	aktywne
46cb86bb-e578-4682-8df6-fa246223d141	EiAs4	2026-05-05	11:00:00	90	Sieci i urządzenia elektryczne	dr inż. T. Sieńko / mgr inż. D. Mamcarz	8	L2	laboratoria	aktywne
665ba1e7-fc05-4bbe-8e7a-39da70b09659	EiAs4	2026-05-05	12:45:00	90	Maszyny elektryczne	dr inż. J. Tulicki / mgr inż. T. Gębarowski	01A / 01B	L5 / L6	laboratoria	aktywne
2ae15fd8-2169-4c21-a738-0aebc62c74a2	EiAs4	2026-05-05	12:45:00	90	Technika mikroprocesorowa	dr inż. K. Suchenia	208E	L4	laboratoria	aktywne
fb5b2c6a-cc06-4ad3-9f78-621edbbbee4c	EiAs4	2026-05-05	12:45:00	90	Język angielski	mgr J. Firganek	139SJO	Lek1	laboratoria	aktywne
2c987046-010e-43e7-8c12-3a9759f53279	EiAs4	2026-05-05	12:45:00	90	Sieci i urządzenia elektryczne	dr inż. T. Sieńko / mgr inż. D. Mamcarz	8	L7	laboratoria	aktywne
82a14e0a-d30a-4b0d-95df-b511e6df4dbd	EiAs4	2026-05-05	14:30:00	90	Maszyny elektryczne	dr inż. J. Tulicki / dr inż. M. Sierżęga	01A / 01B	L7 / L8	laboratoria	aktywne
ee2b8029-0dbd-4d9d-b598-aebb69312740	EiAs4	2026-05-05	14:30:00	90	Technika mikroprocesorowa	dr inż. K. Suchenia	208E	L2	laboratoria	aktywne
b198eafc-e43d-4bf8-a9d1-512b45059e78	EiAs4	2026-05-05	14:30:00	90	Język angielski	mgr J. Firganek	139SJO	Lek2	laboratoria	aktywne
e32be806-4d1e-4379-85c7-7bf224b0d206	EiAs4	2026-05-05	16:15:00	90	Technika mikroprocesorowa	dr inż. K. Suchenia	208E	L5	laboratoria	aktywne
1a143eb4-cc45-4f0b-9e70-cad1ead90fb0	EiAs4	2026-05-05	16:15:00	90	Podstawy programowania w LabVIEW	dr inż. T. Makowski / mgr inż. J. Zielonka	WA2	L8	laboratoria	aktywne
2954df35-4a9d-4ef8-9fab-abdf6082865d	EiAs4	2026-05-06	08:30:00	90	Język niemiecki	mgr E. Targosz	139SJO	Lek	laboratoria	aktywne
31becff8-9d04-479b-aa1f-2228eed12511	EiAs4	2026-05-06	10:30:00	120	Wychowanie fizyczne	CSiR	H/C	C	laboratoria	aktywne
a126a84e-312d-4338-bc36-24d1435ecf55	EiAs4	2026-05-06	12:45:00	90	Technika mikroprocesorowa	dr inż. K. Suchenia	A4	W	wykład	aktywne
5bde0482-e614-40e4-81d6-25906c6adf50	EiAs4	2026-05-06	14:30:00	90	Maszyny elektryczne	prof. A. Warzecha / dr inż. J. Tulicki	A4	W	wykład	aktywne
11f0da97-2a4c-41c6-91ec-ab41dbe932cb	EiAs4	2026-05-06	16:15:00	90	Układy elektromechaniczne	dr inż. Z. Pilch	A1	W	wykład	aktywne
a0a967e4-7d71-4c3e-84b3-f658b0270b76	EiAs4	2026-05-07	09:15:00	135	Energoelektronika	dr inż. W. Czuchra / mgr inż. M. Wawro	013B	L1	laboratoria	aktywne
dd51e95d-7ca7-4649-acbe-622150fa42ae	EiAs4	2026-05-07	09:15:00	90	Maszyny elektryczne	dr inż. A. Shymanska	A1	Ć3	laboratoria	aktywne
5fedef3c-ccee-48a5-8a00-008253da5756	EiAs4	2026-05-07	09:15:00	90	Język angielski	mgr J. Firganek	139SJO	Lek3	laboratoria	aktywne
0e9d8e5f-40d3-4fec-9835-b303837382f2	EiAs4	2026-05-07	09:15:00	90	Podstawy programu Pspice	dr inż. Z. Szular	109B	Lk2	laboratoria	aktywne
8e6fc439-3cf9-4089-aac0-dc724331e38a	EiAs4	2026-05-07	11:00:00	90	Podstawy programu Pspice	dr inż. Z. Szular	109B	Lk3	laboratoria	aktywne
59d5fc7e-3ff8-4c13-a797-90ec83d867bc	EiAs4	2026-05-07	11:45:00	135	Energoelektronika	dr inż. W. Czuchra / mgr inż. M. Wawro	013B	L2	laboratoria	aktywne
7b8e7cc8-7b4a-4e03-b769-20661da31b4b	EiAs4	2026-05-07	12:30:00	90	Układy elektromechaniczne	dr inż. Z. Pilch	A1	Ć3	laboratoria	aktywne
c909a17b-f0c8-4bfb-957d-fd034c28ce1d	EiAs4	2026-05-07	12:45:00	90	Podstawy programu Pspice	dr inż. Z. Szular	109B	Lk4	laboratoria	aktywne
bbc33882-1c70-46ad-8ab1-206e76824bf8	EiAs4	2026-05-07	14:15:00	135	Energoelektronika	dr inż. W. Czuchra / mgr inż. M. Wawro	013B	L5	laboratoria	aktywne
43d907df-db3c-4b6b-ad1b-69763032c6a9	EiAs4	2026-05-07	16:45:00	135	Energoelektronika	dr inż. W. Czuchra / mgr inż. M. Wawro	013B	L4	laboratoria	aktywne
e4ccd966-d301-40c0-92a6-c91a03e65b9b	EiAs4	2026-05-08	10:00:00	135	Energoelektronika	prof. W. Mazgaj	A4	W	wykład	aktywne
2c6353ef-cee3-4922-b70e-71b0b001db8d	EiAs4	2026-05-08	12:30:00	90	Energoelektronika	prof. W. Mazgaj	A4	Ć1	laboratoria	aktywne
6fff383e-b33f-434f-a6b4-7250f6e1ce0a	EiAs4	2026-05-08	12:30:00	90	Układy elektromechaniczne	dr inż. Z. Pilch	10	Ć2	laboratoria	aktywne
53f71f2d-01dd-4d8b-a30b-dc4661a729c9	EiAs4	2026-05-11	07:30:00	90	Sieci i urządzenia elektryczne	mgr inż. S. Nachman	A4	Ć1	laboratoria	aktywne
fb6ce612-c4a0-4af2-bdf5-9de5a11e61f2	EiAs4	2026-05-11	09:15:00	90	Maszyny elektryczne	dr inż. A. Shymanska	10	Ć1	laboratoria	aktywne
b46f54a1-e24b-4b84-af1d-7afdf67e606d	EiAs4	2026-05-11	09:15:00	90	Technika mikroprocesorowa	mgr inż. M. Raźny	208E	L6	laboratoria	aktywne
0bfd2861-337b-4d21-b174-513d27b4c9cd	EiAs4	2026-05-11	09:15:00	90	Sieci i urządzenia elektryczne	dr inż. T. Sieńko / mgr inż. D. Mamcarz	8	L5	laboratoria	aktywne
13565be5-e939-489e-ad13-5bb317cb114e	EiAs4	2026-05-11	09:15:00	90	Podstawy programowania w LabVIEW	mgr inż. K. Sołtys	12	Lk6	laboratoria	aktywne
5130721a-c41a-4129-898e-15a04e3fd33b	EiAs4	2026-05-11	11:00:00	90	Maszyny elektryczne	dr inż. A. Shymanska	10	Ć2	laboratoria	aktywne
71b2d121-c2d3-4318-9cbc-0e39fe4629a6	EiAs4	2026-05-11	11:00:00	90	Energoelektronika	mgr inż. M. Wawro	A1	Ć3	laboratoria	aktywne
c5cfc198-6402-424e-aee1-ad1508cf7d57	EiAs4	2026-05-11	11:00:00	90	Sieci i urządzenia elektryczne	dr inż. T. Sieńko / mgr inż. D. Mamcarz	8	L3	laboratoria	aktywne
b7e22f53-de39-4454-8c87-161b2d8cd13d	EiAs4	2026-05-11	11:00:00	90	Podstawy programowania w LabVIEW	mgr inż. K. Sołtys	12	Lk1	laboratoria	aktywne
7cc144a6-cb8c-44a3-839d-640eb56ec4d7	EiAs4	2026-05-11	12:45:00	90	Technika mikroprocesorowa	dr inż. S. Żaba	06	L7 / P5	laboratoria	aktywne
f84f842d-c9f1-4a0f-a94b-b818fe067112	EiAs4	2026-05-11	12:45:00	90	Energoelektronika	mgr inż. M. Wawro	A1	Ć2	laboratoria	aktywne
a76e4677-926b-4b5e-85fa-cdad6f10be1f	EiAs4	2026-05-11	12:45:00	90	Podstawy programowania w LabVIEW	dr inż. T. Makowski / mgr inż. J. Zielonka	WA2	L2	laboratoria	aktywne
4982ff81-5bd2-4012-8652-0e5915111513	EiAs4	2026-05-11	14:30:00	90	Podstawy programowania w LabVIEW	dr inż. T. Makowski / mgr inż. J. Zielonka	WA2	L7	laboratoria	aktywne
efbb8094-d943-4396-910c-c0b7f04ef849	EiAs4	2026-05-11	14:30:00	90	Podstawy programowania w LabVIEW	mgr inż. K. Sołtys	12	Lk3	laboratoria	aktywne
c761e43f-f070-4420-b2a9-bed9e57dcc38	EiAs4	2026-05-11	16:15:00	90	Podstawy programowania w LabVIEW	dr inż. T. Makowski / mgr inż. J. Zielonka	WA2	L4	laboratoria	aktywne
e9eeda85-00be-42cf-9daa-a126d25c0b82	EiAs4	2026-05-11	16:15:00	90	Podstawy programowania w LabVIEW	mgr inż. K. Sołtys	12	Lk4	laboratoria	aktywne
86a736e9-23c8-4879-82e7-5412f51cb98f	EiAs4	2026-05-11	18:00:00	90	Podstawy programowania w LabVIEW	dr inż. T. Makowski / mgr inż. J. Zielonka	WA2	L6	laboratoria	aktywne
1678fdf3-2487-4f68-9555-e11650c2003b	EiAs4	2026-05-11	19:45:00	90	Technika mikroprocesorowa	dr inż. A. Drwal	06	L8 / P6	laboratoria	aktywne
1bd8d2d3-7399-4974-89a6-d6d826484c87	EiAs4	2026-05-12	07:00:00	900	Święto Szkoły	Brak	-	Wszystkie grupy	święto	wolne
ba21f4af-83dd-4068-9a6e-fcd0b9b17cfb	EiAs4	2026-05-13	08:30:00	90	Język niemiecki	mgr E. Targosz	139SJO	Lek	laboratoria	aktywne
481db605-a6a7-4c1e-9c57-f47c241fc2d7	EiAs4	2026-05-13	10:30:00	120	Wychowanie fizyczne	CSiR	H/C	C	laboratoria	aktywne
f29b879b-0a97-4e66-a09c-d9e6358cef33	EiAs4	2026-05-13	14:30:00	90	Maszyny elektryczne	prof. A. Warzecha / dr inż. J. Tulicki	A4	W	wykład	aktywne
a6bd2551-8655-4555-b665-b759288949d9	EiAs4	2026-05-13	16:15:00	90	Układy elektromechaniczne	dr inż. Z. Pilch	A1	W	wykład	aktywne
c0bd6f44-6cf7-43de-bd8a-c0eb36212942	EiAs4	2026-05-13	18:00:00	90	Układy elektromechaniczne	dr inż. Z. Pilch	12	P5	laboratoria	aktywne
04ac10ab-bcd7-4221-991c-b65d12fee5ce	EiAs4	2026-05-13	19:45:00	90	Układy elektromechaniczne	dr inż. Z. Pilch	12	P6	laboratoria	aktywne
d5321332-f42e-411d-9df6-873457292410	EiAs4	2026-05-14	09:15:00	135	Energoelektronika	dr inż. W. Czuchra / mgr inż. M. Wawro	013B	L3	laboratoria	aktywne
2c6de35d-ea9a-471a-9530-f802d460e692	EiAs4	2026-05-14	09:15:00	90	Maszyny elektryczne	dr inż. A. Shymanska	A1	Ć3	laboratoria	aktywne
86642bed-83f1-4a3e-a32c-479cce40a944	EiAs4	2026-05-14	09:15:00	90	Język angielski	mgr J. Firganek	139SJO	Lek3	laboratoria	aktywne
ab205e05-4847-4d3b-9f64-f1fd5113db56	EiAs4	2026-05-14	09:15:00	90	Podstawy programu Pspice	dr inż. Z. Szular	109B	Lk1	laboratoria	aktywne
1ef8d08a-7240-4fec-91d7-1c77617f0584	EiAs4	2026-05-14	11:00:00	90	Podstawy programu Pspice	dr inż. Z. Szular	109B	Lk6	laboratoria	aktywne
b725febb-f742-4bdb-872c-ce4d8c6b10fb	EiAs4	2026-05-14	11:45:00	135	Energoelektronika	dr inż. W. Czuchra / mgr inż. M. Wawro	013B	L6	laboratoria	aktywne
f9e0e14c-13e4-4e62-a738-3bd6a63250cf	EiAs4	2026-05-14	12:30:00	90	Układy elektromechaniczne	dr inż. Z. Pilch	A1	Ć1	laboratoria	aktywne
747083b3-3850-477e-8205-9bbe26ca042e	EiAs4	2026-05-14	12:45:00	90	Podstawy programu Pspice	dr inż. Z. Szular	109B	Lk5	laboratoria	aktywne
e36422cd-8647-4439-8fb5-bb8244ac1f17	EiAs4	2026-05-14	14:15:00	135	Energoelektronika	dr inż. W. Czuchra / mgr inż. M. Wawro	013B	L7	laboratoria	aktywne
637d161d-b378-4219-adde-ec9abab5911b	EiAs4	2026-05-14	14:15:00	90	Układy elektromechaniczne	dr inż. Z. Pilch	12	P1	laboratoria	aktywne
b42bd6de-c2da-4b9e-b955-1adcb0f750df	EiAs4	2026-05-14	16:00:00	90	Układy elektromechaniczne	dr inż. Z. Pilch	12	P3	laboratoria	aktywne
bf4f1d25-d44d-490a-bd78-b5d8ae02e38d	EiAs4	2026-05-14	16:45:00	135	Energoelektronika	dr inż. W. Czuchra / mgr inż. M. Wawro	013B	L8	laboratoria	aktywne
b653a226-b201-4d2a-bd0d-ca18fa60150b	EiAs4	2026-05-14	17:45:00	90	Układy elektromechaniczne	dr inż. Z. Pilch	12	P2	laboratoria	aktywne
713268d9-0b00-4ed3-a9b5-5c1404e1a3fc	EiAs4	2026-05-14	19:30:00	90	Układy elektromechaniczne	dr inż. Z. Pilch	12	P4	laboratoria	aktywne
9ce91080-f1bf-4028-9429-d88b578faccb	EiAs4	2026-05-15	11:30:00	45	Energoelektronika	prof. W. Mazgaj	A4	W	wykład	aktywne
6240787d-bab7-4299-bdc7-8b5b3e459dbf	EiAs4	2026-05-15	12:30:00	90	Energoelektronika	prof. W. Mazgaj	A4	Ć1	laboratoria	aktywne
e55cd5f7-b4b5-4fce-8338-737be8ce94da	EiAs4	2026-05-18	07:30:00	90	Sieci i urządzenia elektryczne	dr inż. T. Sieńko	A4	W	wykład	aktywne
ce233d1c-2611-4096-912a-c6c192cd69b8	EiAs4	2026-05-18	09:15:00	90	Maszyny elektryczne	dr inż. A. Shymanska	10	Ć1	laboratoria	aktywne
67cc7354-d289-473c-a82f-90da94784678	EiAs4	2026-05-18	09:15:00	90	Sieci i urządzenia elektryczne	dr inż. T. Sieńko / mgr inż. D. Mamcarz	8	L4	laboratoria	aktywne
d9a8f800-e68d-4e4b-b38e-f56bd9bfd260	EiAs4	2026-05-18	09:15:00	90	Podstawy programowania w LabVIEW	mgr inż. K. Sołtys	12	Lk5	laboratoria	aktywne
71cd1f69-44f1-4eaf-8c36-2d0a50e388cf	EiAs4	2026-05-18	11:00:00	90	Maszyny elektryczne	dr inż. A. Shymanska	10	Ć2	laboratoria	aktywne
677ebb0f-5279-46de-bba7-c55848f6a0a0	EiAs4	2026-05-18	11:00:00	90	Sieci i urządzenia elektryczne	dr inż. T. Sieńko / mgr inż. D. Mamcarz	8	L1	laboratoria	aktywne
732ac661-006b-40bf-add4-62be2190055e	EiAs4	2026-05-18	11:00:00	90	Podstawy programowania w LabVIEW	mgr inż. K. Sołtys	12	Lk2	laboratoria	aktywne
82ba9500-003f-49b5-9a49-e22037689e10	EiAs4	2026-05-18	12:45:00	90	Technika mikroprocesorowa	dr inż. S. Żaba	06	L7 / P5	laboratoria	aktywne
d5c0ad4f-7495-473a-bfe4-cf4460f79e61	EiAs4	2026-05-18	12:45:00	90	Podstawy programowania w LabVIEW	dr inż. T. Makowski / mgr inż. J. Zielonka	WA2	L1	laboratoria	aktywne
f5c7c57e-9e50-488d-958b-78005e7122b8	EiAs4	2026-05-18	14:30:00	90	Podstawy programowania w LabVIEW	dr inż. T. Makowski	A3	W	wykład	aktywne
4a2543a7-871d-4446-ad55-0dea423cb17f	EiAs4	2026-05-18	16:15:00	90	Podstawy programowania w LabVIEW	dr inż. T. Makowski / mgr inż. J. Zielonka	WA2	L3	laboratoria	aktywne
13a7616f-7586-49fe-8674-db2920a7dc6f	EiAs4	2026-05-18	18:00:00	90	Podstawy programowania w LabVIEW	dr inż. T. Makowski / mgr inż. J. Zielonka	WA2	L5	laboratoria	aktywne
c5cf6695-7134-4a5b-a130-e9cd1a1f940c	EiAs4	2026-05-18	19:45:00	90	Technika mikroprocesorowa	dr inż. A. Drwal	06	L8 / P6	laboratoria	aktywne
0415d5fd-0742-4e84-a78b-1c696498d692	EIAs6I	2026-04-05	07:00:00	900	Przerwa świąteczna	Brak	-	Wszystkie grupy	święto	wolne
814cfcf8-9b40-4994-9aaf-763f9b3a723f	EiAs4	2026-05-19	09:15:00	90	Maszyny elektryczne	dr inż. J. Tulicki / mgr inż. P. Oziębło	01A / 01B	L1 / L2	laboratoria	aktywne
73f532a3-ecf8-451a-9328-fb981ad1096f	EiAs4	2026-05-19	09:15:00	90	Technika mikroprocesorowa	dr inż. K. Suchenia	208E	P3	laboratoria	aktywne
758df853-d41d-4485-938e-29c3628a97df	EiAs4	2026-05-19	09:15:00	90	Sieci i urządzenia elektryczne	dr inż. T. Sieńko	A1	Ć2	laboratoria	aktywne
834a4d22-c2aa-4c3f-8035-670bfd55b0d4	EiAs4	2026-05-19	11:00:00	90	Maszyny elektryczne	dr inż. M. Sierżęga / mgr inż. T. Gębarowski	01A / 01B	L3 / L4	laboratoria	aktywne
76b91a17-94b8-4280-a201-b9388ec0258c	EiAs4	2026-05-19	11:00:00	90	Technika mikroprocesorowa	dr inż. K. Suchenia	208E	P1	laboratoria	aktywne
acb5d262-7fd5-426f-8df9-159e040e7873	EiAs4	2026-05-19	11:00:00	90	Język angielski	mgr J. Firganek	136SJO	Lek4	laboratoria	aktywne
8777ca88-0f91-4123-a219-9cfa28a634f9	EiAs4	2026-05-19	11:00:00	90	Sieci i urządzenia elektryczne	dr inż. T. Sieńko / mgr inż. D. Mamcarz	8	L2	laboratoria	aktywne
e29cb8ce-44bc-402b-8bd2-7599d10a160b	EiAs4	2026-05-19	12:45:00	90	Maszyny elektryczne	dr inż. J. Tulicki / mgr inż. T. Gębarowski	01A / 01B	L5 / L6	laboratoria	aktywne
d942423a-43cd-42c8-9686-d851e901521c	EiAs4	2026-05-19	12:45:00	90	Technika mikroprocesorowa	dr inż. K. Suchenia	208E	P2	laboratoria	aktywne
68b7d5fa-d087-4bd4-a1eb-8d29e2afff63	EiAs4	2026-05-19	12:45:00	90	Język angielski	mgr J. Firganek	139SJO	Lek1	laboratoria	aktywne
bff875ef-ce92-4460-965f-7c2cb8086a20	EiAs4	2026-05-19	12:45:00	90	Sieci i urządzenia elektryczne	dr inż. T. Sieńko / mgr inż. D. Mamcarz	8	L7	laboratoria	aktywne
aeee0665-6992-4b21-ac9b-5a05571b1243	EiAs4	2026-05-19	14:30:00	90	Maszyny elektryczne	dr inż. J. Tulicki / dr inż. M. Sierżęga	01A / 01B	L7 / L8	laboratoria	aktywne
2375638d-b07d-4044-a49e-e54ec477cd7a	EiAs4	2026-05-19	14:30:00	90	Technika mikroprocesorowa	dr inż. K. Suchenia	208E	P4	laboratoria	aktywne
2b4d6022-4c48-472b-8474-f14aa896c6bc	EiAs4	2026-05-19	14:30:00	90	Język angielski	mgr J. Firganek	139SJO	Lek2	laboratoria	aktywne
81521d23-4458-464b-9ab4-6ca54bb5fba3	EiAs4	2026-05-19	16:15:00	90	Podstawy programowania w LabVIEW	dr inż. T. Makowski / mgr inż. J. Zielonka	WA2	L8	laboratoria	aktywne
84c0abb1-3546-4932-80f1-321ae6d4d0b9	EiAs4	2026-05-20	08:30:00	90	Język niemiecki	mgr E. Targosz	139SJO	Lek	laboratoria	aktywne
1102435d-d2dd-46b5-b7b9-d3afa81fd71a	EiAs4	2026-05-20	10:30:00	120	Wychowanie fizyczne	CSiR	H/C	C	laboratoria	aktywne
d771205e-8e51-45d8-a73a-4f109080eae1	EiAs4	2026-05-20	14:30:00	90	Maszyny elektryczne	prof. A. Warzecha / dr inż. J. Tulicki	A4	W	wykład	aktywne
94e11c22-88a2-46ea-b91f-8a114c6e16d2	EiAs4	2026-05-20	16:15:00	90	Układy elektromechaniczne	dr inż. Z. Pilch	A1	W	wykład	aktywne
d7cd1cd6-1917-40bc-85ed-1e3a9a3a579f	EiAs4	2026-05-21	09:15:00	90	Energoelektronika	dr inż. W. Czuchra / mgr inż. M. Wawro	013B	L1	laboratoria	aktywne
86c117f9-0654-4f84-a97d-2cb73959f11e	EiAs4	2026-05-21	09:15:00	90	Maszyny elektryczne	dr inż. A. Shymanska	A1	Ć3	laboratoria	aktywne
f3c52fa5-77a4-4088-8854-07c02ae5bf10	EiAs4	2026-05-21	09:15:00	90	Język angielski	mgr J. Firganek	139SJO	Lek3	laboratoria	aktywne
9a596cc2-9f1c-422d-9bdc-2eb8458d70c6	EiAs4	2026-05-21	09:15:00	90	Podstawy programu Pspice	dr inż. Z. Szular	109B	Lk2	laboratoria	aktywne
7541c4ae-17dc-4a46-bcff-f920688d9a11	EiAs4	2026-05-21	11:00:00	90	Podstawy programu Pspice	dr inż. Z. Szular	109B	Lk3	laboratoria	aktywne
e842d283-9140-4fc0-b57a-8774c064fe2a	EiAs4	2026-05-21	11:45:00	90	Energoelektronika	dr inż. W. Czuchra / mgr inż. M. Wawro	013B	L2	laboratoria	aktywne
abb958b6-b46c-4d95-b1e1-9cfd0c1ceb82	EiAs4	2026-05-21	12:00:00	135	Układy elektromechaniczne	dr inż. Z. Pilch	A2	Ć3	laboratoria	aktywne
c08f5e62-31b4-4338-a91b-6be460cadea5	EiAs4	2026-05-21	12:45:00	90	Podstawy programu Pspice	dr inż. Z. Szular	109B	Lk4	laboratoria	aktywne
8e502108-b512-4faf-9c16-3cb484f4654c	EiAs4	2026-05-21	14:15:00	90	Energoelektronika	dr inż. W. Czuchra / mgr inż. M. Wawro	013B	L5	laboratoria	aktywne
7f94898a-a288-4140-aa31-4a9c3a267c93	EiAs4	2026-05-21	16:45:00	90	Energoelektronika	dr inż. W. Czuchra / mgr inż. M. Wawro	013B	L4	laboratoria	aktywne
b4dc445a-9cc0-43c5-bdda-0ddd961c1797	EiAs4	2026-05-22	12:30:00	90	Energoelektronika	prof. W. Mazgaj	A4	Ć1	laboratoria	aktywne
b95b63cd-6d8f-432a-bcc6-e772a509e5be	EiAs4	2026-05-22	12:30:00	90	Układy elektromechaniczne	dr inż. Z. Pilch	10	Ć2	laboratoria	aktywne
5bb293b9-9fe5-494f-9b71-eb9f13747671	EiAs4	2026-05-24	07:00:00	900	Zielone Świątki	Brak	-	Wszystkie grupy	święto	wolne
52cc03ec-397b-457f-afc7-c02f3ec44569	EiAs4	2026-05-25	09:15:00	90	Maszyny elektryczne	dr inż. A. Shymanska	10	Ć1	laboratoria	aktywne
cdf45ecb-e0d8-44e2-bfda-fdc529a4b616	EiAs4	2026-05-25	09:15:00	90	Sieci i urządzenia elektryczne	dr inż. T. Sieńko / mgr inż. D. Mamcarz	8	L5	laboratoria	aktywne
93aa4401-7155-4642-85ce-d73fa586fd43	EiAs4	2026-05-25	09:15:00	90	Podstawy programowania w LabVIEW	mgr inż. K. Sołtys	12	Lk6	laboratoria	aktywne
9221a6bf-58cf-4837-9a93-932feb78cfc1	EiAs4	2026-05-25	11:00:00	90	Maszyny elektryczne	dr inż. A. Shymanska	10	Ć2	laboratoria	aktywne
73645280-cf41-4b0e-a203-91d8d66a0fe8	EiAs4	2026-05-25	11:00:00	90	Sieci i urządzenia elektryczne	dr inż. T. Sieńko / mgr inż. D. Mamcarz	8	L3	laboratoria	aktywne
969c2366-1dc8-4c1c-8546-8aa2bd64c333	EiAs4	2026-05-25	11:00:00	90	Podstawy programowania w LabVIEW	mgr inż. K. Sołtys	12	Lk1	laboratoria	aktywne
19ef7d7b-2bf0-4ca2-adb0-e3b36f24159a	EiAs4	2026-05-25	12:45:00	90	Technika mikroprocesorowa	dr inż. S. Żaba	06	L7 / P5	laboratoria	aktywne
b4c2a645-b226-40be-a0e9-7e7c78f09c80	EiAs4	2026-05-25	12:45:00	90	Podstawy programowania w LabVIEW	dr inż. T. Makowski / mgr inż. J. Zielonka	WA2	L2	laboratoria	aktywne
ce87daaf-edeb-40a9-a45f-c32da6b1cf83	EiAs4	2026-05-25	14:30:00	90	Podstawy programowania w LabVIEW	dr inż. T. Makowski / mgr inż. J. Zielonka	WA2	L7	laboratoria	aktywne
5c69438c-7f64-4fde-86af-cc57492ca28f	EiAs4	2026-05-25	14:30:00	90	Podstawy programowania w LabVIEW	mgr inż. K. Sołtys	12	Lk3	laboratoria	aktywne
7d0116cf-cac7-4e83-a7ed-0dd0ba311ad1	EiAs4	2026-05-25	16:15:00	90	Podstawy programowania w LabVIEW	dr inż. T. Makowski / mgr inż. J. Zielonka	WA2	L4	laboratoria	aktywne
93aea0f0-a67e-4d1b-9510-827359178d1c	EiAs4	2026-05-25	16:15:00	90	Podstawy programowania w LabVIEW	mgr inż. K. Sołtys	12	Lk4	laboratoria	aktywne
fe8a1f52-1967-47c0-9e0e-3bb1810e232d	EiAs4	2026-05-25	18:00:00	90	Podstawy programowania w LabVIEW	dr inż. T. Makowski / mgr inż. J. Zielonka	WA2	L6	laboratoria	aktywne
1106393e-3faa-409b-bde4-ab8d4c8083c0	EiAs4	2026-05-25	19:45:00	90	Technika mikroprocesorowa	dr inż. A. Drwal	06	L8 / P6	laboratoria	aktywne
8a99485a-92c0-47be-8b7f-72b848bc6f48	EiAs4	2026-05-26	09:15:00	90	Maszyny elektryczne	dr inż. J. Tulicki / mgr inż. P. Oziębło	01A / 01B	L1 / L2	laboratoria	aktywne
b8596668-b5a7-43fe-9ae4-21049c544564	EiAs4	2026-05-26	09:15:00	90	Technika mikroprocesorowa	dr inż. K. Suchenia	208E	P3	laboratoria	aktywne
62cba767-3826-418c-a87a-32faa339b5bf	EiAs4	2026-05-26	11:00:00	90	Maszyny elektryczne	dr inż. M. Sierżęga / mgr inż. T. Gębarowski	01A / 01B	L3 / L4	laboratoria	aktywne
ad6e9b7c-fdcd-4341-a281-26bae39df26c	EiAs4	2026-05-26	11:00:00	90	Technika mikroprocesorowa	dr inż. K. Suchenia	208E	P1	laboratoria	aktywne
65a277a3-7cfd-4510-b564-9ff24795f92a	EiAs4	2026-05-26	11:00:00	90	Język angielski	mgr J. Firganek	136SJO	Lek4	laboratoria	aktywne
2d54231d-c99c-4fc2-bc30-73c6a0062e92	EiAs4	2026-06-08	09:15:00	90	Maszyny elektryczne	dr inż. A. Shymanska	10	Ć1	laboratoria	aktywne
e99ccdf2-2a87-4db5-a1b7-2c5d6a69d928	EiAs4	2026-05-26	11:00:00	90	Sieci i urządzenia elektryczne	dr inż. T. Sieńko / mgr inż. D. Mamcarz	8	L6	laboratoria	aktywne
8db1e902-3c17-489f-ab6f-eac78dbdd373	EiAs4	2026-05-26	12:45:00	90	Maszyny elektryczne	dr inż. J. Tulicki / mgr inż. T. Gębarowski	01A / 01B	L5 / L6	laboratoria	aktywne
eefb5d9b-2cc9-4aec-93a8-208554f5d5b2	EiAs4	2026-05-26	12:45:00	90	Technika mikroprocesorowa	dr inż. K. Suchenia	208E	P2	laboratoria	aktywne
6ebf4f2b-1656-4abd-a8ae-c247d27cb93e	EiAs4	2026-05-26	12:45:00	90	Język angielski	mgr J. Firganek	139SJO	Lek1	laboratoria	aktywne
852eed2d-dddf-4915-8f5b-f97ff6050dbd	EiAs4	2026-05-26	12:45:00	90	Sieci i urządzenia elektryczne	dr inż. T. Sieńko / mgr inż. D. Mamcarz	8	L8	laboratoria	aktywne
fe20e040-dc0b-4fc5-8068-6d594fe4c8c5	EiAs4	2026-05-26	14:30:00	90	Maszyny elektryczne	dr inż. J. Tulicki / dr inż. M. Sierżęga	01A / 01B	L7 / L8	laboratoria	aktywne
8b93462e-4515-4f89-b646-f37272090cf5	EiAs4	2026-05-26	14:30:00	90	Technika mikroprocesorowa	dr inż. K. Suchenia	208E	P4	laboratoria	aktywne
c44f41f1-a34c-40af-9434-307f739eb2f8	EiAs4	2026-05-26	14:30:00	90	Język angielski	mgr J. Firganek	139SJO	Lek2	laboratoria	aktywne
58d2708e-3348-4b19-a65d-04465088af11	EiAs4	2026-05-27	08:30:00	90	Język niemiecki	mgr E. Targosz	139SJO	Lek	laboratoria	aktywne
aa5d8edf-d78b-4df1-8cb1-0fe9b6513d59	EiAs4	2026-05-27	10:30:00	120	Wychowanie fizyczne	CSiR	H/C	C	laboratoria	aktywne
b0e196dc-a86a-41a6-b316-1f720ca41a9c	EiAs4	2026-05-27	14:30:00	90	Maszyny elektryczne	prof. A. Warzecha / dr inż. J. Tulicki	A4	W	wykład	aktywne
66807dfb-0c19-40ea-be92-65d2f32c5284	EiAs4	2026-05-27	16:15:00	45	Układy elektromechaniczne	dr inż. Z. Pilch	A1	W	wykład	aktywne
c5ff1696-1a28-45b6-a0b6-696c7cb4c415	EiAs4	2026-05-28	09:15:00	135	Energoelektronika	dr inż. W. Czuchra / mgr inż. M. Wawro	013B	L3	laboratoria	aktywne
b5d4548b-170d-4b6d-acd9-2c8b9a3885df	EiAs4	2026-05-28	09:15:00	90	Maszyny elektryczne	dr inż. A. Shymanska	A1	Ć3	laboratoria	aktywne
73b0be45-5409-428a-9cbc-9e1fa03dd9f4	EiAs4	2026-05-28	09:15:00	90	Język angielski	mgr J. Firganek	139SJO	Lek3	laboratoria	aktywne
fd2c4dc4-da58-4033-aa93-0233a87cb9ec	EiAs4	2026-05-28	09:15:00	90	Podstawy programu Pspice	dr inż. Z. Szular	109B	Lk1	laboratoria	aktywne
7f88176d-0ecb-4e78-90a7-58d2ebab6821	EiAs4	2026-05-28	11:00:00	90	Podstawy programu Pspice	dr inż. Z. Szular	109B	Lk6	laboratoria	aktywne
0a080cec-a811-45d9-848c-dcb8f12c6b6f	EiAs4	2026-05-28	11:45:00	135	Energoelektronika	dr inż. W. Czuchra / mgr inż. M. Wawro	013B	L6	laboratoria	aktywne
d8e07b79-f3c3-4f38-86d2-20d05f504535	EiAs4	2026-05-28	12:30:00	90	Układy elektromechaniczne	dr inż. Z. Pilch	A1	Ć1	laboratoria	aktywne
384c0e11-1d74-42de-8976-2b29be2a2098	EiAs4	2026-05-28	12:45:00	90	Podstawy programu Pspice	dr inż. Z. Szular	109B	Lk5	laboratoria	aktywne
24c6c40a-4142-4ec3-ac03-a5f23e080404	EiAs4	2026-05-28	14:15:00	135	Energoelektronika	dr inż. W. Czuchra / mgr inż. M. Wawro	013B	L7	laboratoria	aktywne
705a0a40-b295-4441-9637-8e844ef8cee4	EiAs4	2026-05-28	16:45:00	135	Energoelektronika	dr inż. W. Czuchra / mgr inż. M. Wawro	013B	L8	laboratoria	aktywne
bcd463aa-fc7d-42ad-99fe-f1976a19e7ef	EiAs4	2026-06-01	07:30:00	90	Sieci i urządzenia elektryczne	dr inż. T. Sieńko	A4	W	wykład	aktywne
87cc73ae-bbfc-4356-825b-d41f16949eae	EiAs4	2026-06-01	09:15:00	90	Maszyny elektryczne	dr inż. A. Shymanska	10	Ć1	laboratoria	aktywne
7008d5b0-8d2a-4bc4-86e6-825e8415b6de	EiAs4	2026-06-01	09:15:00	90	Sieci i urządzenia elektryczne	dr inż. T. Sieńko / mgr inż. D. Mamcarz	8	L4	laboratoria	aktywne
86bf8d91-5b24-4e36-8892-120c07c75b36	EiAs4	2026-06-01	09:15:00	90	Podstawy programowania w LabVIEW	mgr inż. K. Sołtys	12	Lk5	laboratoria	aktywne
dc089d6e-c392-4fb8-b328-4133c5d0399b	EiAs4	2026-06-01	11:00:00	90	Maszyny elektryczne	dr inż. A. Shymanska	10	Ć2	laboratoria	aktywne
a95f9ef0-f53c-4369-8f38-1203770f3ab6	EiAs4	2026-06-01	11:00:00	90	Sieci i urządzenia elektryczne	dr inż. T. Sieńko / mgr inż. D. Mamcarz	8	L1	laboratoria	aktywne
25746b22-da0b-435a-8741-7f0880205a17	EiAs4	2026-06-01	12:45:00	90	Technika mikroprocesorowa	dr inż. S. Żaba	06	L7 / P5	laboratoria	aktywne
66728910-6986-4289-8645-ec2be0282bfd	EiAs4	2026-06-01	12:45:00	90	Podstawy programowania w LabVIEW	dr inż. T. Makowski / mgr inż. J. Zielonka	WA2	L1	laboratoria	aktywne
c5ac1e0b-a4f5-4eca-ab2d-3d81367f77a8	EiAs4	2026-06-01	12:45:00	90	Podstawy programowania w LabVIEW	mgr inż. K. Sołtys	12	Lk2	laboratoria	aktywne
6d11f336-feba-42c6-b01b-12ac4b4fc417	EiAs4	2026-06-01	16:15:00	90	Podstawy programowania w LabVIEW	dr inż. T. Makowski / mgr inż. J. Zielonka	WA2	L3	laboratoria	aktywne
69d7f364-8a54-4468-8799-2a53e70fc61b	EiAs4	2026-06-01	18:00:00	90	Podstawy programowania w LabVIEW	dr inż. T. Makowski / mgr inż. J. Zielonka	WA2	L5	laboratoria	aktywne
30c6ccb6-a093-4a37-b826-a8318224cf4f	EiAs4	2026-06-01	19:45:00	90	Technika mikroprocesorowa	dr inż. A. Drwal	06	L8 / P6	laboratoria	aktywne
f7f07792-8652-4ebd-bf83-58fb4d208d9f	EiAs4	2026-06-02	09:15:00	90	Maszyny elektryczne	dr inż. J. Tulicki / mgr inż. P. Oziębło	01A / 01B	L1 / L2	laboratoria	aktywne
4cf9fe7c-e881-41f8-b05d-faa1fabe20b8	EiAs4	2026-06-02	09:15:00	90	Technika mikroprocesorowa	dr inż. K. Suchenia	208E	P3	laboratoria	aktywne
518213c1-e0d1-4f35-9717-275d7450eed6	EiAs4	2026-06-02	11:00:00	90	Maszyny elektryczne	dr inż. M. Sierżęga / mgr inż. T. Gębarowski	01A / 01B	L3 / L4	laboratoria	aktywne
afa21a4c-72ad-4431-a0d5-ebc59cdd0a7f	EiAs4	2026-06-02	11:00:00	90	Technika mikroprocesorowa	dr inż. K. Suchenia	208E	P1	laboratoria	aktywne
f4b983e0-21d5-4e88-a6ca-0b2cb4e0721e	EiAs4	2026-06-02	11:00:00	90	Język angielski	mgr J. Firganek	136SJO	Lek4	laboratoria	aktywne
c524bd73-3bac-4904-8073-9038714614fd	EiAs4	2026-06-02	11:00:00	90	Sieci i urządzenia elektryczne	dr inż. T. Sieńko / mgr inż. D. Mamcarz	8	L2	laboratoria	aktywne
f83536b1-2aaa-473a-844b-16c62e0d35f2	EiAs4	2026-06-02	12:45:00	90	Maszyny elektryczne	dr inż. J. Tulicki / mgr inż. T. Gębarowski	01A / 01B	L5 / L6	laboratoria	aktywne
74a0ac71-9494-4aac-b761-c5bc3499e721	EiAs4	2026-06-02	12:45:00	90	Technika mikroprocesorowa	dr inż. K. Suchenia	208E	P2	laboratoria	aktywne
d673cf15-bac2-428a-b5f8-f89afbcac580	EiAs4	2026-06-02	12:45:00	90	Język angielski	mgr J. Firganek	139SJO	Lek1	laboratoria	aktywne
0e928dba-dcaf-4086-b7af-a32c3e8d59e1	EiAs4	2026-06-02	12:45:00	90	Sieci i urządzenia elektryczne	dr inż. T. Sieńko / mgr inż. D. Mamcarz	8	L7	laboratoria	aktywne
22504650-7452-43be-8114-a6d17943a535	EiAs4	2026-06-02	14:30:00	90	Maszyny elektryczne	dr inż. J. Tulicki / dr inż. M. Sierżęga	01A / 01B	L7 / L8	laboratoria	aktywne
6d3942e5-2936-44b0-bd25-54ae15e1dadd	EiAs4	2026-06-02	14:30:00	90	Technika mikroprocesorowa	dr inż. K. Suchenia	208E	P4	laboratoria	aktywne
ae2b1885-dad8-4730-883f-e619cfc537b9	EiAs4	2026-06-02	14:30:00	90	Język angielski	mgr J. Firganek	139SJO	Lek2	laboratoria	aktywne
149513a8-a574-4ef6-9ac5-2f28c532e79c	EiAs4	2026-06-02	16:15:00	90	Podstawy programowania w LabVIEW	dr inż. T. Makowski / mgr inż. J. Zielonka	WA2	L8	laboratoria	aktywne
4802e03b-ff26-40b1-a461-1ca111529bc1	EiAs4	2026-06-03	08:30:00	90	Język niemiecki	mgr E. Targosz	139SJO	Lek	laboratoria	aktywne
00fdea91-3aeb-4d5f-b586-5fa99b6a68f1	EiAs4	2026-06-03	10:30:00	120	Wychowanie fizyczne	CSiR	H/C	C	laboratoria	aktywne
0a399d8b-bb65-4242-aa0c-fa3dc175b7cc	EiAs4	2026-06-03	14:30:00	90	Maszyny elektryczne	prof. A. Warzecha / dr inż. J. Tulicki	A4	W	wykład	aktywne
b7734a31-0f7e-4e44-965a-1223673a8182	EiAs4	2026-06-04	07:00:00	900	Boże Ciało	Brak	-	Wszystkie grupy	święto	wolne
0ff18b42-ce85-4c7d-afe9-411f245f3727	EiAs4	2026-06-08	09:15:00	45	Sieci i urządzenia elektryczne	dr inż. T. Sieńko / mgr inż. D. Mamcarz	8	L5	laboratoria	aktywne
f836bae7-874e-4383-9d55-f0b5f5190175	EiAs4	2026-06-08	09:15:00	45	Podstawy programowania w LabVIEW	mgr inż. K. Sołtys	12	Lk6	laboratoria	aktywne
6bfe1c40-ad04-4420-87d4-5b475899c259	EiAs4	2026-06-08	11:00:00	90	Maszyny elektryczne	dr inż. A. Shymanska	10	Ć2	laboratoria	aktywne
05426da2-e8d6-40bd-b0a0-8434bc99347c	EiAs4	2026-06-08	11:00:00	45	Sieci i urządzenia elektryczne	dr inż. T. Sieńko / mgr inż. D. Mamcarz	8	L3	laboratoria	aktywne
6b429e32-f31a-445c-97d4-ad922e31101d	EiAs4	2026-06-08	11:00:00	45	Podstawy programowania w LabVIEW	mgr inż. K. Sołtys	12	Lk1	laboratoria	aktywne
f1d2d9ac-7423-4cc0-8143-33e1ac6f4c67	EiAs4	2026-06-08	12:45:00	90	Technika mikroprocesorowa	dr inż. S. Żaba	06	L7 / P5	laboratoria	aktywne
0c9bcd46-9f74-4e8e-b968-15e23826363f	EiAs4	2026-06-08	12:45:00	45	Podstawy programowania w LabVIEW	dr inż. T. Makowski / mgr inż. J. Zielonka	WA2	L2	laboratoria	aktywne
2a14ff7f-208e-455f-8ba3-1d66e0467f5a	EiAs4	2026-06-08	14:30:00	45	Podstawy programowania w LabVIEW	dr inż. T. Makowski / mgr inż. J. Zielonka	WA2	L7	laboratoria	aktywne
2b490a58-4e5d-412a-9eae-dfb69dd806a4	EiAs4	2026-06-08	14:30:00	45	Podstawy programowania w LabVIEW	mgr inż. K. Sołtys	12	Lk3	laboratoria	aktywne
328669e2-41bc-4112-b12b-a8c7af187622	EiAs4	2026-06-08	16:15:00	45	Podstawy programowania w LabVIEW	dr inż. T. Makowski / mgr inż. J. Zielonka	WA2	L4	laboratoria	aktywne
a864978e-0f31-45e2-b54d-c4d07ca157c5	EiAs4	2026-06-08	16:15:00	45	Podstawy programowania w LabVIEW	mgr inż. K. Sołtys	12	Lk4	laboratoria	aktywne
ae02f7c8-7e7e-4911-8deb-84f85f420dd7	EiAs4	2026-06-08	18:00:00	45	Podstawy programowania w LabVIEW	dr inż. T. Makowski / mgr inż. J. Zielonka	WA2	L6	laboratoria	aktywne
a35b6f8c-2edd-4ca4-b9c2-9fec7d7c01ce	EiAs4	2026-06-08	19:45:00	90	Technika mikroprocesorowa	dr inż. A. Drwal	06	L8 / P6	laboratoria	aktywne
235092fe-5308-460b-aea8-193887746209	EiAs4	2026-06-09	09:15:00	90	Maszyny elektryczne	dr inż. J. Tulicki / mgr inż. P. Oziębło	01A / 01B	L1 / L2	laboratoria	aktywne
50e41011-381b-4b04-ad2e-94d456972015	EiAs4	2026-06-09	09:15:00	90	Technika mikroprocesorowa	dr inż. K. Suchenia	208E	P3	laboratoria	aktywne
4b022fa2-42ce-456d-ab09-fa3c67d2edc1	EiAs4	2026-06-09	11:00:00	90	Maszyny elektryczne	dr inż. M. Sierżęga / mgr inż. T. Gębarowski	01A / 01B	L3 / L4	laboratoria	aktywne
898466ed-dffe-4789-9fb0-7ed0f5a36e77	EiAs4	2026-06-09	11:00:00	90	Technika mikroprocesorowa	dr inż. K. Suchenia	208E	P1	laboratoria	aktywne
cca8c260-62f9-4182-b324-26ed32979408	EiAs4	2026-06-09	11:00:00	90	Język angielski	mgr J. Firganek	136SJO	Lek4	laboratoria	aktywne
ac44004b-e319-4243-820e-b8b3a83493fc	EiAs4	2026-06-09	11:00:00	90	Sieci i urządzenia elektryczne	dr inż. T. Sieńko / mgr inż. D. Mamcarz	8	L6	laboratoria	aktywne
e5779543-c1bc-4aa6-8f6b-db51f0254895	EiAs4	2026-06-09	12:45:00	90	Maszyny elektryczne	dr inż. J. Tulicki / mgr inż. T. Gębarowski	01A / 01B	L5 / L6	laboratoria	aktywne
58f7be03-1f38-4b70-b522-b65083162816	EiAs4	2026-06-09	12:45:00	90	Technika mikroprocesorowa	dr inż. K. Suchenia	208E	P2	laboratoria	aktywne
8fffbc39-bc04-4994-8697-5afe254a7a10	EiAs4	2026-06-09	12:45:00	90	Język angielski	mgr J. Firganek	139SJO	Lek1	laboratoria	aktywne
24246de2-2d79-4d3a-b8a5-57058547be08	EiAs4	2026-06-09	12:45:00	90	Sieci i urządzenia elektryczne	dr inż. T. Sieńko / mgr inż. D. Mamcarz	8	L8	laboratoria	aktywne
abda389c-94b2-4b2d-b050-d2d2e76e2b71	EiAs4	2026-06-09	14:30:00	90	Maszyny elektryczne	dr inż. J. Tulicki / dr inż. M. Sierżęga	01A / 01B	L7 / L8	laboratoria	aktywne
dd2a486e-c500-4451-b623-38a71c8a599b	EiAs4	2026-06-09	14:30:00	90	Technika mikroprocesorowa	dr inż. K. Suchenia	208E	P4	laboratoria	aktywne
785a976d-7d4e-4558-9ce8-868931e65f1f	EiAs4	2026-06-09	14:30:00	90	Język angielski	mgr J. Firganek	139SJO	Lek2	laboratoria	aktywne
2e3b4767-dcc7-4ed4-a8f8-5e8b78a72351	EiAs4	2026-06-10	08:30:00	90	Język niemiecki	mgr E. Targosz	139SJO	Lek	laboratoria	aktywne
f9959a54-e935-47c4-9b73-254f0f5bf947	EiAs4	2026-06-10	10:30:00	120	Wychowanie fizyczne	CSiR	H/C	C	laboratoria	aktywne
3511f25a-05e1-417c-8a8b-c558b165e254	EiAs4	2026-06-10	14:30:00	90	Maszyny elektryczne	prof. A. Warzecha / dr inż. J. Tulicki	A4	W	wykład	aktywne
9f4992e3-cf75-4157-a265-901319697923	EiAs4	2026-06-11	08:30:00	135	Podstawy programu Pspice	dr inż. Z. Szular	109B	Lk1	laboratoria	aktywne
e48e4f2f-3f79-4220-b31f-de691b97f9a3	EiAs4	2026-06-11	09:15:00	90	Energoelektronika	dr inż. W. Czuchra / mgr inż. M. Wawro	013B	L3	laboratoria	aktywne
1419bf3c-c873-47ac-8921-f8b543486918	EiAs4	2026-06-11	09:15:00	90	Maszyny elektryczne	dr inż. A. Shymanska	A1	Ć3	laboratoria	aktywne
d6bf8a1a-0039-4896-b8ef-5948f493abe2	EiAs4	2026-06-11	09:15:00	90	Język angielski	mgr J. Firganek	139SJO	Lek3	laboratoria	aktywne
e871bcbe-2a4a-41d2-8a21-3918ce29f888	EiAs4	2026-06-11	11:00:00	90	Podstawy programu Pspice	dr inż. Z. Szular	109B	Lk6	laboratoria	aktywne
ceb48108-ac40-4bc7-8595-b3ebdee4ed57	EiAs4	2026-06-11	11:45:00	90	Energoelektronika	dr inż. W. Czuchra / mgr inż. M. Wawro	013B	L6	laboratoria	aktywne
2b90c471-6d37-44c7-b6d7-36f5b60160f9	EiAs4	2026-06-11	12:30:00	90	Układy elektromechaniczne	dr inż. Z. Pilch	A1	Ć1	laboratoria	aktywne
506c68f4-6111-4dfa-8a2c-512bd675b848	EiAs4	2026-06-11	12:45:00	90	Podstawy programu Pspice	dr inż. Z. Szular	109B	Lk5	laboratoria	aktywne
8ce4e95d-9796-47a9-ad2c-405783956c1d	EiAs4	2026-06-11	14:15:00	90	Energoelektronika	dr inż. W. Czuchra / mgr inż. M. Wawro	013B	L7	laboratoria	aktywne
06d2829b-9165-4ac7-ae1d-fceffd3f9030	EiAs4	2026-06-11	16:45:00	90	Energoelektronika	dr inż. W. Czuchra / mgr inż. M. Wawro	013B	L8	laboratoria	aktywne
95252e50-32b2-4de3-bd4e-c94d7fc30c98	EiAs4	2026-06-15	09:15:00	90	Maszyny elektryczne	dr inż. A. Shymanska	10	Ć1	laboratoria	aktywne
6113d09e-413e-4305-a279-fbe1f1474c4d	EiAs4	2026-06-15	09:15:00	90	Sieci i urządzenia elektryczne	dr inż. T. Sieńko / mgr inż. D. Mamcarz	8	L4	laboratoria	aktywne
2e23215d-1880-4423-9d81-7f14b87f7497	EiAs4	2026-06-15	09:15:00	90	Podstawy programowania w LabVIEW	mgr inż. K. Sołtys	12	Lk5	laboratoria	aktywne
ba5f6d79-3a3c-42da-8139-b8469536381a	EiAs4	2026-06-15	11:00:00	90	Maszyny elektryczne	dr inż. A. Shymanska	10	Ć2	laboratoria	aktywne
71446a98-8aa3-4f7d-894b-a968590ef87a	EiAs4	2026-06-15	11:00:00	90	Sieci i urządzenia elektryczne	dr inż. T. Sieńko / mgr inż. D. Mamcarz	8	L1	laboratoria	aktywne
778f4372-5033-48e9-9607-c1bed0aee5de	EiAs4	2026-06-15	12:45:00	90	Technika mikroprocesorowa	dr inż. S. Żaba	06	L7 / P5	laboratoria	aktywne
9ff9130a-3831-4405-93f6-b0de53935453	EiAs4	2026-06-15	12:45:00	90	Podstawy programowania w LabVIEW	dr inż. T. Makowski / mgr inż. J. Zielonka	WA2	L1	laboratoria	aktywne
bf33bd64-d909-42b1-8354-d5a134bb3d35	EiAs4	2026-06-15	12:45:00	90	Podstawy programowania w LabVIEW	mgr inż. K. Sołtys	12	Lk2	laboratoria	aktywne
a560ae3b-d932-4048-b442-78952ddd65df	EiAs4	2026-06-15	16:15:00	90	Podstawy programowania w LabVIEW	dr inż. T. Makowski / mgr inż. J. Zielonka	WA2	L3	laboratoria	aktywne
d3c50626-e2a4-4437-bb31-9f070bea1d13	EiAs4	2026-06-15	18:00:00	90	Podstawy programowania w LabVIEW	dr inż. T. Makowski / mgr inż. J. Zielonka	WA2	L5	laboratoria	aktywne
1d95e342-9a33-4cfd-be73-defd3084c457	EiAs4	2026-06-16	09:15:00	90	Maszyny elektryczne	dr inż. J. Tulicki / mgr inż. P. Oziębło	01A / 01B	L1 / L2	laboratoria	aktywne
619e24de-72fc-494b-80a7-6b58e74c6f06	EiAs4	2026-06-16	09:15:00	90	Technika mikroprocesorowa	dr inż. K. Suchenia	208E	P3	laboratoria	aktywne
e62b066c-ca10-4ead-a289-8b2d12ee74b7	EiAs4	2026-06-16	11:00:00	90	Maszyny elektryczne	dr inż. M. Sierżęga / mgr inż. T. Gębarowski	01A / 01B	L3 / L4	laboratoria	aktywne
664cdc23-a3dc-4aac-bbc8-34733174c15a	EiAs4	2026-06-16	11:00:00	90	Technika mikroprocesorowa	dr inż. K. Suchenia	208E	P1	laboratoria	aktywne
c36f2fd3-5813-42e5-9083-a7c36f2d34bd	EiAs4	2026-06-16	11:00:00	90	Język angielski	mgr J. Firganek	136SJO	Lek4	laboratoria	aktywne
b6cad001-c8f2-4364-8302-a08f50558406	EiAs4	2026-06-16	11:00:00	45	Sieci i urządzenia elektryczne	dr inż. T. Sieńko / mgr inż. D. Mamcarz	8	L2	laboratoria	aktywne
600c5df0-379a-472f-9394-0c7d0dc835e3	EiAs4	2026-06-16	12:45:00	90	Maszyny elektryczne	dr inż. J. Tulicki / mgr inż. T. Gębarowski	01A / 01B	L5 / L6	laboratoria	aktywne
92ca8c79-1cc0-496e-ae70-ef4cdc632d9b	EiAs4	2026-06-16	12:45:00	90	Technika mikroprocesorowa	dr inż. K. Suchenia	208E	P2	laboratoria	aktywne
ddf3d24c-1e31-4f1b-b8c2-50234bb82e0a	EiAs4	2026-06-16	12:45:00	90	Język angielski	mgr J. Firganek	139SJO	Lek1	laboratoria	aktywne
06a0f62e-2a92-4359-8fce-fe2f6cbc78cc	EiAs4	2026-06-16	12:45:00	45	Sieci i urządzenia elektryczne	dr inż. T. Sieńko / mgr inż. D. Mamcarz	8	L7	laboratoria	aktywne
a48a0029-f23e-4426-b356-b4d31d7b16a5	EiAs4	2026-06-16	14:30:00	90	Maszyny elektryczne	dr inż. J. Tulicki / dr inż. M. Sierżęga	01A / 01B	L7 / L8	laboratoria	aktywne
e3ad5d55-3a07-47ce-a111-4058a0f7f818	EiAs4	2026-06-16	14:30:00	90	Technika mikroprocesorowa	dr inż. K. Suchenia	208E	P4	laboratoria	aktywne
1b874390-651f-4f4d-a233-5aa352fc5093	EiAs4	2026-06-16	14:30:00	90	Język angielski	mgr J. Firganek	139SJO	Lek2	laboratoria	aktywne
76866f0a-d221-4566-a440-cda503cad16b	EiAs4	2026-06-16	16:15:00	45	Podstawy programowania w LabVIEW	dr inż. T. Makowski / mgr inż. J. Zielonka	WA2	L8	laboratoria	aktywne
8e376f70-93e3-4604-8a1b-da8037ca4dc4	EIAs6A	2026-02-26	09:15:00	90	Sztuczna inteligencja	mgr inż. J. Krupiński	18	Lk1A	laboratoria	aktywne
0ae765d3-73d3-40d0-9845-4c880bcdbc88	EIAs6A	2026-02-26	11:00:00	90	Sztuczna inteligencja	mgr inż. J. Krupiński	18	Lk2A	laboratoria	aktywne
657da777-5bff-49ae-a9aa-a4209abb6220	EIAs6A	2026-02-26	12:45:00	90	Sztuczna inteligencja	prof. Z. Kokosiński / dr inż. M. Dudzik	A3	W	wykład	aktywne
596af4eb-425d-4684-baa9-301ca9c34e58	EIAs6A	2026-03-04	14:30:00	90	Komputerowe systemy sterowania	dr inż. G. Pędrak	11	L1	laboratoria	aktywne
848f897e-a950-4302-b7b1-f43b0440af9a	EIAs6A	2026-03-05	09:15:00	90	Sztuczna inteligencja	mgr inż. J. Krupiński	18	Lk1A	laboratoria	aktywne
2ae0512a-e884-4e53-9cf4-70c28cbfc156	EIAs6A	2026-03-05	11:00:00	90	Sztuczna inteligencja	mgr inż. J. Krupiński	18	Lk2A	laboratoria	aktywne
8bc20577-0fd5-45b1-8b64-873d8768be46	EIAs6A	2026-03-11	14:30:00	90	Komputerowe systemy sterowania	dr inż. G. Pędrak	11	L2	laboratoria	aktywne
e2ad61ee-51f5-447d-868c-c78f895f2a15	EIAs6A	2026-03-11	16:15:00	90	Komputerowe systemy sterowania	dr inż. G. Pędrak	9	W	wykład	aktywne
ed143faf-bd94-4d74-b8a7-65e674bdb7f8	EIAs6A	2026-03-12	09:15:00	90	Sztuczna inteligencja	mgr inż. J. Krupiński	18	Lk1A	laboratoria	aktywne
c7738855-026a-484d-b0b9-38c88c726a11	EIAs6A	2026-03-12	11:00:00	90	Sztuczna inteligencja	mgr inż. J. Krupiński	18	Lk2A	laboratoria	aktywne
ca57c08c-0167-4c30-b460-a5161d90638f	EIAs6A	2026-03-12	12:45:00	90	Sztuczna inteligencja	prof. Z. Kokosiński / dr inż. M. Dudzik	A3	W	wykład	aktywne
02f0e78b-978c-4c9c-a301-a42028cae848	EIAs6A	2026-03-18	14:30:00	90	Komputerowe systemy sterowania	dr inż. G. Pędrak	11	L1	laboratoria	aktywne
ecfb336c-61ab-4fb8-9c7e-f81d3f12eaf0	EIAs6A	2026-03-18	16:15:00	90	Komputerowe systemy sterowania	dr inż. G. Pędrak	9	W	wykład	aktywne
f2d2bc71-d117-4ec2-8c91-693276ddf3d3	EIAs6A	2026-03-19	09:15:00	90	Sztuczna inteligencja	mgr inż. J. Krupiński	18	Lk1A	laboratoria	aktywne
07bf0323-78c3-4cbb-94ae-39be8685629a	EIAs6A	2026-03-19	11:00:00	90	Sztuczna inteligencja	mgr inż. J. Krupiński	18	Lk2A	laboratoria	aktywne
ff92abfe-7082-45f7-8063-ffd6068710f1	EIAs6A	2026-03-25	14:30:00	90	Komputerowe systemy sterowania	dr inż. G. Pędrak	11	L2	laboratoria	aktywne
44ba792a-9b8a-416b-a20c-dcee71c44b39	EIAs6A	2026-03-26	09:15:00	90	Sztuczna inteligencja	mgr inż. J. Krupiński	18	Lk1A	laboratoria	aktywne
67983413-490d-409e-a688-b96b549c685a	EIAs6A	2026-03-26	11:00:00	90	Sztuczna inteligencja	mgr inż. J. Krupiński	18	Lk2A	laboratoria	aktywne
f27c99ef-c5ab-44cb-b2c0-121f891ae7e4	EIAs6A	2026-03-26	12:45:00	90	Sztuczna inteligencja	prof. Z. Kokosiński / dr inż. M. Dudzik	A3	W	wykład	aktywne
7f5ac732-a53e-40a0-9d13-1c8cc37a8cfe	EIAs6A	2026-04-01	07:00:00	900	Przerwa świąteczna	Brak	-	Wszystkie grupy	święto	wolne
55a990fa-a12a-4f42-9512-1ccf2bdb2d18	EIAs6A	2026-04-02	07:00:00	900	Przerwa świąteczna	Brak	-	Wszystkie grupy	święto	wolne
d69b5112-05c4-4206-8912-2661539d551e	EIAs6A	2026-04-03	07:00:00	900	Przerwa świąteczna	Brak	-	Wszystkie grupy	święto	wolne
81538d7d-5c1b-436b-be74-38820d0d148f	EIAs6A	2026-04-04	07:00:00	900	Przerwa świąteczna	Brak	-	Wszystkie grupy	święto	wolne
45bfcc33-80bd-443c-86dd-404d996b8f08	EIAs6A	2026-04-05	07:00:00	900	Przerwa świąteczna	Brak	-	Wszystkie grupy	święto	wolne
39280c65-c05f-46eb-b6cf-6254bd62ab45	EIAs6A	2026-04-06	07:00:00	900	Przerwa świąteczna	Brak	-	Wszystkie grupy	święto	wolne
74ff37ab-db3b-4fb1-8e81-7300a35e735b	EIAs6A	2026-04-07	07:00:00	900	Przerwa świąteczna	Brak	-	Wszystkie grupy	święto	wolne
5a8aa5f2-c8d8-4424-860c-83e89e5bd9ee	EIAs6A	2026-04-08	14:30:00	90	Komputerowe systemy sterowania	dr inż. G. Pędrak	11	L2	laboratoria	aktywne
b26b3a2a-65b1-4feb-ae26-a820c8c40aff	EIAs6A	2026-04-09	09:15:00	90	Sztuczna inteligencja	mgr inż. J. Krupiński	18	Lk1A	laboratoria	aktywne
44b5da2c-8757-4b56-9ff9-67bb53a4aac4	EIAs6A	2026-04-09	11:00:00	90	Sztuczna inteligencja	mgr inż. J. Krupiński	18	Lk2A	laboratoria	aktywne
2e2ad2d3-578d-459b-80bc-60d47f6457a3	EIAs6A	2026-04-09	12:45:00	90	Sztuczna inteligencja	prof. Z. Kokosiński / dr inż. M. Dudzik	A3	W	wykład	aktywne
aa2c9368-85a0-4dd9-9276-2443f06884c7	EIAs6A	2026-04-15	14:30:00	90	Komputerowe systemy sterowania	dr inż. G. Pędrak	11	L1	laboratoria	aktywne
43cc8c8d-3714-4f37-a00c-33985a5af155	EIAs6A	2026-04-15	16:15:00	90	Komputerowe systemy sterowania	dr inż. G. Pędrak	9	W	wykład	aktywne
d89af64b-0c90-4654-8024-1720aa6bb58d	EIAs6A	2026-04-16	09:15:00	90	Sztuczna inteligencja	mgr inż. J. Krupiński	18	Lk1A	laboratoria	aktywne
c7c44f64-c9ee-4b20-b24a-0c4657831e0b	EIAs6A	2026-04-16	11:00:00	90	Sztuczna inteligencja	mgr inż. J. Krupiński	18	Lk2A	laboratoria	aktywne
c675d9b0-799c-4fcc-a279-722d7fbfc4bd	EIAs6A	2026-04-22	14:30:00	90	Komputerowe systemy sterowania	dr inż. G. Pędrak	11	L2	laboratoria	aktywne
c9059ccc-fd6e-4023-b495-3c8b4afaba5a	EIAs6A	2026-04-23	09:15:00	90	Sztuczna inteligencja	mgr inż. J. Krupiński	18	Lk1A	laboratoria	aktywne
bb99e48e-b31e-451c-bcfc-356bc5af927f	EIAs6A	2026-04-23	11:00:00	90	Sztuczna inteligencja	mgr inż. J. Krupiński	18	Lk2A	laboratoria	aktywne
6ff89228-42ed-412c-8a59-4caad54cc797	EIAs6A	2026-04-23	12:45:00	90	Sztuczna inteligencja	prof. Z. Kokosiński / dr inż. M. Dudzik	A3	W	wykład	aktywne
9ba10508-473e-4806-ba1d-f8ab1496b46f	EIAs6A	2026-04-29	14:30:00	90	Komputerowe systemy sterowania	dr inż. G. Pędrak	11	L1	laboratoria	aktywne
6e609ee5-114e-437d-8942-349693be4ce7	EIAs6A	2026-04-29	16:15:00	90	Komputerowe systemy sterowania	dr inż. G. Pędrak	9	W	wykład	aktywne
0b0e3f09-749b-4fab-991e-577adbe162cc	EIAs6A	2026-04-30	09:15:00	90	Sztuczna inteligencja	mgr inż. J. Krupiński	18	Lk1A	laboratoria	aktywne
65d0e6ce-a5c3-4504-998f-0ab65a0b5d97	EIAs6I	2026-04-03	07:00:00	900	Przerwa świąteczna	Brak	-	Wszystkie grupy	święto	wolne
e7acda25-431b-4d75-b62d-677711875547	EIAs6A	2026-04-30	11:00:00	90	Sztuczna inteligencja	mgr inż. J. Krupiński	18	Lk2A	laboratoria	aktywne
27f054c0-fba3-45d3-a6ca-1dde5d1422be	EIAs6A	2026-05-01	07:00:00	900	Majówka	Brak	-	Wszystkie grupy	święto	wolne
c9acc5d7-1e87-4f13-b939-00c88bc81efe	EIAs6A	2026-05-02	07:00:00	900	Majówka	Brak	-	Wszystkie grupy	święto	wolne
49411ece-28b3-4c1f-9ede-4c5b911d3011	EIAs6A	2026-05-03	07:00:00	900	Majówka	Brak	-	Wszystkie grupy	święto	wolne
0ac5d73c-3ca5-4b51-a65d-40773e17abe9	EIAs6A	2026-05-04	07:00:00	900	Majówka	Brak	-	Wszystkie grupy	święto	wolne
8fda4935-96e3-44b7-a81a-6e83fa9334b8	EIAs6A	2026-05-06	14:30:00	90	Komputerowe systemy sterowania	dr inż. G. Pędrak	11	L2	laboratoria	aktywne
decdfa35-6cc3-4cde-948e-36e1c80315f1	EIAs6A	2026-05-07	09:15:00	90	Sztuczna inteligencja	mgr inż. J. Krupiński	18	Lk1A	laboratoria	aktywne
294df449-9bbb-46b9-9150-193aea4d47ff	EIAs6A	2026-05-07	11:00:00	90	Sztuczna inteligencja	mgr inż. J. Krupiński	18	Lk2A	laboratoria	aktywne
ecbecd37-2f50-4750-a212-d2a2d911bfea	EIAs6A	2026-05-07	12:45:00	90	Sztuczna inteligencja	prof. Z. Kokosiński / dr inż. M. Dudzik	A3	W	wykład	aktywne
7c96d72a-9756-40e1-ae02-bfa7f0696d7a	EIAs6A	2026-05-12	07:00:00	900	Święto Szkoły	Brak	-	Wszystkie grupy	święto	wolne
aa788615-017c-41b1-a679-c2dce670cdae	EIAs6A	2026-05-13	14:30:00	90	Komputerowe systemy sterowania	dr inż. G. Pędrak	11	L1	laboratoria	aktywne
103a7c71-0ede-4cac-88f9-8c88175fe378	EIAs6A	2026-05-14	09:15:00	90	Sztuczna inteligencja	mgr inż. J. Krupiński	18	Lk1A	laboratoria	aktywne
45c51133-6f4d-47b1-a232-55dc8ed14704	EIAs6A	2026-05-14	11:00:00	90	Sztuczna inteligencja	mgr inż. J. Krupiński	18	Lk2A	laboratoria	aktywne
d84f6556-b41f-48ef-be59-6f46b33dde3e	EIAs6A	2026-05-20	14:30:00	90	Komputerowe systemy sterowania	dr inż. G. Pędrak	11	L2	laboratoria	aktywne
056d30a7-888b-4ac6-899c-28163c4a6993	EIAs6A	2026-05-21	09:15:00	90	Sztuczna inteligencja	mgr inż. J. Krupiński	18	Lk1A	laboratoria	aktywne
c0eb4628-c639-4a72-9c78-8fdf9ff0690d	EIAs6A	2026-05-21	11:00:00	90	Sztuczna inteligencja	mgr inż. J. Krupiński	18	Lk2A	laboratoria	aktywne
bbabdad2-6394-4138-87b1-cc4846aef0f7	EIAs6A	2026-05-21	15:00:00	90	Sztuczna inteligencja	prof. Z. Kokosiński / dr inż. M. Dudzik	A3	W	wykład	aktywne
cfd2263a-220b-44cb-92cf-cadc9bbe9090	EIAs6A	2026-05-24	07:00:00	900	Zielone Świątki	Brak	-	Wszystkie grupy	święto	wolne
293ec4b7-951e-4bc6-b6fa-b7f48f1682cb	EIAs6A	2026-05-27	14:30:00	90	Komputerowe systemy sterowania	dr inż. G. Pędrak	11	L1	laboratoria	aktywne
dd4ab6e9-5d74-486c-a217-999ee3429f51	EIAs6A	2026-05-28	08:30:00	135	Sztuczna inteligencja	mgr inż. J. Krupiński	18	Lk1A	laboratoria	aktywne
6da20557-e1ca-4a5b-af99-ed939b5c6fd8	EIAs6A	2026-05-28	11:00:00	90	Sztuczna inteligencja	mgr inż. J. Krupiński	18	Lk2A	laboratoria	aktywne
6addb460-4673-468b-8d6b-463fd50a9784	EIAs6A	2026-06-03	13:45:00	135	Komputerowe systemy sterowania	dr inż. G. Pędrak	11	L2	laboratoria	aktywne
96a3447a-0d76-4468-ab60-e6121a4615c9	EIAs6A	2026-06-04	07:00:00	900	Boże Ciało	Brak	-	Wszystkie grupy	święto	wolne
5eb863c4-acc5-40da-9dc9-5a77ca23928a	EIAs6A	2026-06-05	07:00:00	900	Boże Ciało	Brak	-	Wszystkie grupy	święto	wolne
4d2b9e94-65a9-4ee2-8a91-73d45d648c46	EIAs6A	2026-06-10	14:30:00	135	Komputerowe systemy sterowania	dr inż. G. Pędrak	11	L1	laboratoria	aktywne
074cd71c-11f9-4917-bb65-0a7d7ae7c433	EIAs6A	2026-06-11	08:30:00	135	Sztuczna inteligencja	mgr inż. J. Krupiński	18	Lk1A	laboratoria	aktywne
2ee60d2a-88ab-415a-a50c-de0529a7e98d	EIAs6A	2026-06-11	11:00:00	90	Sztuczna inteligencja	mgr inż. J. Krupiński	18	Lk2A	laboratoria	aktywne
7fb7279d-10d5-4044-a36e-5055fef7ffe1	EIAs6I	2026-02-24	14:30:00	90	Użytkowe pakiety programowe	dr inż. T. Makowski / mgr inż. J. Zielonka	12	Lk1I	laboratoria	aktywne
2204a1aa-8635-416d-9a43-1a485dece784	EIAs6I	2026-02-24	18:00:00	90	Użytkowe pakiety programowe	dr inż. T. Makowski / mgr inż. J. Zielonka	12	Lk2I	laboratoria	aktywne
4918e167-8b51-48e6-a08c-a98f4dacf8c9	EIAs6I	2026-02-26	07:30:00	90	Jakość energii elektrycznej	dr inż. T. Sieńko / mgr inż. D. Mamcarz	8	L3	laboratoria	aktywne
056b55a9-486c-48cf-a5e4-736c1be8111e	EIAs6I	2026-02-26	09:15:00	90	Jakość energii elektrycznej	dr inż. T. Sieńko / mgr inż. D. Mamcarz	8	L4	laboratoria	aktywne
f0eca1d0-b375-4dca-a6b5-d0a6c6d7dba5	EIAs6I	2026-03-03	14:30:00	90	Użytkowe pakiety programowe	dr inż. T. Makowski / mgr inż. J. Zielonka	12	Lk1I	laboratoria	aktywne
20d48b80-2b58-4646-a64c-2ca93e462c73	EIAs6I	2026-03-03	16:15:00	90	Użytkowe pakiety programowe	dr inż. T. Makowski / mgr inż. J. Zielonka	A4	W	wykład	aktywne
e48fe038-7320-4d08-9116-9d0ddc98134d	EIAs6I	2026-03-03	18:00:00	90	Użytkowe pakiety programowe	dr inż. T. Makowski / mgr inż. J. Zielonka	12	Lk2I	laboratoria	aktywne
0c8b2cb8-b152-4612-b880-6ed1958907ff	EIAs6I	2026-03-05	07:30:00	90	Jakość energii elektrycznej	dr inż. T. Sieńko	A2	W	wykład	aktywne
529b7fb5-5ba7-498c-9248-a9005a77f656	EIAs6I	2026-03-10	14:30:00	90	Użytkowe pakiety programowe	dr inż. T. Makowski / mgr inż. J. Zielonka	12	Lk1I	laboratoria	aktywne
4fc43d06-bbd8-4c11-b587-8145944e172b	EIAs6I	2026-03-10	18:00:00	90	Użytkowe pakiety programowe	dr inż. T. Makowski / mgr inż. J. Zielonka	12	Lk2I	laboratoria	aktywne
3f770d31-c218-4361-a96b-33ca92f3e0f6	EIAs6I	2026-03-12	07:30:00	90	Jakość energii elektrycznej	dr inż. T. Sieńko / mgr inż. D. Mamcarz	8	L3	laboratoria	aktywne
653ce241-382f-4607-a736-809b3ef92d8e	EIAs6I	2026-03-12	09:15:00	90	Jakość energii elektrycznej	dr inż. T. Sieńko / mgr inż. D. Mamcarz	8	L4	laboratoria	aktywne
9ee40552-c6a5-4cc3-8db1-54a8e806c46f	EIAs6I	2026-03-17	16:45:00	90	Użytkowe pakiety programowe	dr inż. T. Makowski / mgr inż. J. Zielonka	A4	W	wykład	aktywne
c4e35c98-47bf-4334-9035-097ee97f4374	EIAs6I	2026-03-17	18:15:00	90	Użytkowe pakiety programowe	dr inż. T. Makowski / mgr inż. J. Zielonka	12	Lk2I	laboratoria	aktywne
febf87d8-08df-4c11-9048-5865be88902f	EIAs6I	2026-03-17	19:45:00	90	Użytkowe pakiety programowe	dr inż. T. Makowski / mgr inż. J. Zielonka	12	Lk1I	laboratoria	aktywne
5a73686a-80c8-4b36-80da-1ada73b4b532	EIAs6I	2026-03-19	07:30:00	90	Jakość energii elektrycznej	dr inż. T. Sieńko	A2	W	wykład	aktywne
cc96aeaf-4948-4f62-804d-f01692f2212d	EIAs6I	2026-03-24	18:00:00	90	Użytkowe pakiety programowe	dr inż. T. Makowski / mgr inż. J. Zielonka	12	Lk2I	laboratoria	aktywne
8f3faf70-a8aa-4939-bf44-6b77d55665a4	EIAs6I	2026-03-24	19:45:00	90	Użytkowe pakiety programowe	dr inż. T. Makowski / mgr inż. J. Zielonka	12	Lk1I	laboratoria	aktywne
fb1444b2-1d88-44f8-82bc-c930bdc0c933	EIAs6I	2026-03-26	07:30:00	90	Jakość energii elektrycznej	dr inż. T. Sieńko / mgr inż. D. Mamcarz	8	L3	laboratoria	aktywne
a03f1103-8e69-4343-86ff-758301a44003	EIAs6I	2026-03-26	09:15:00	90	Jakość energii elektrycznej	dr inż. T. Sieńko / mgr inż. D. Mamcarz	8	L4	laboratoria	aktywne
26fa6d35-1f79-4517-bb5b-3d39f7357941	EIAs6I	2026-03-31	16:45:00	90	Użytkowe pakiety programowe	dr inż. T. Makowski / mgr inż. J. Zielonka	A4	W	wykład	aktywne
c6a02000-51c4-420f-979e-0c06ec30bc6b	EIAs6I	2026-03-31	18:15:00	90	Użytkowe pakiety programowe	dr inż. T. Makowski / mgr inż. J. Zielonka	12	Lk2I	laboratoria	aktywne
a3371d45-0cb1-468e-89dc-eb3fd082b297	EIAs6I	2026-03-31	19:45:00	90	Użytkowe pakiety programowe	dr inż. T. Makowski / mgr inż. J. Zielonka	12	Lk1I	laboratoria	aktywne
afb26df1-f730-495f-99cb-9df2b57f214a	EIAs6I	2026-04-01	07:00:00	900	Przerwa świąteczna	Brak	-	Wszystkie grupy	święto	wolne
4c414f60-ff04-4282-b93d-f6f713932877	EIAs6I	2026-04-02	07:00:00	900	Przerwa świąteczna	Brak	-	Wszystkie grupy	święto	wolne
647bc1c6-f225-473e-ba6e-f86391db2668	EIAs6I	2026-04-06	07:00:00	900	Przerwa świąteczna	Brak	-	Wszystkie grupy	święto	wolne
6f4cd460-69cf-470e-994e-168b7deb8843	EIAs6I	2026-04-07	07:00:00	900	Przerwa świąteczna	Brak	-	Wszystkie grupy	święto	wolne
170c56eb-72fa-4c0e-9ffb-1e1b26c7cd21	EIAs6I	2026-04-09	07:30:00	90	Jakość energii elektrycznej	dr inż. T. Sieńko / mgr inż. D. Mamcarz	8	L3	laboratoria	aktywne
805d30d3-21e2-4b9f-9bbb-dd43bcf617de	EIAs6I	2026-04-09	09:15:00	90	Jakość energii elektrycznej	dr inż. T. Sieńko / mgr inż. D. Mamcarz	8	L4	laboratoria	aktywne
647bc9a1-fa5c-42b2-9757-4bdbf6dd675e	EIAs6I	2026-04-14	14:30:00	90	Użytkowe pakiety programowe	dr inż. T. Makowski / mgr inż. J. Zielonka	12	Lk1I	laboratoria	aktywne
14794204-f6d0-4ba8-9511-96a6e21594a0	EIAs6I	2026-04-14	16:15:00	90	Użytkowe pakiety programowe	dr inż. T. Makowski / mgr inż. J. Zielonka	A4	W	wykład	aktywne
b3f88b1a-6e63-4d86-bbe0-af5ed9097411	EIAs6I	2026-04-14	18:00:00	90	Użytkowe pakiety programowe	dr inż. T. Makowski / mgr inż. J. Zielonka	12	Lk2I	laboratoria	aktywne
28638ea2-9ad9-4417-bb97-69e8fcdf1e05	EIAs6I	2026-04-16	07:30:00	90	Jakość energii elektrycznej	dr inż. T. Sieńko	A2	W	wykład	aktywne
42927e89-fb62-45ce-972c-47072e1b4b43	EIAs6I	2026-04-21	14:30:00	90	Użytkowe pakiety programowe	dr inż. T. Makowski / mgr inż. J. Zielonka	12	Lk1I	laboratoria	aktywne
255e8f12-a06c-4fa1-a793-3a983b36d36e	EIAs6I	2026-04-21	18:00:00	90	Użytkowe pakiety programowe	dr inż. T. Makowski / mgr inż. J. Zielonka	12	Lk2I	laboratoria	aktywne
1543e7bb-8c63-4d44-a768-e65b047f7408	EIAs6I	2026-04-23	07:30:00	90	Jakość energii elektrycznej	dr inż. T. Sieńko / mgr inż. D. Mamcarz	8	L3	laboratoria	aktywne
e61eedb1-4d2c-4ecc-961e-348fdb47cd6c	EIAs6I	2026-04-23	09:15:00	90	Jakość energii elektrycznej	dr inż. T. Sieńko / mgr inż. D. Mamcarz	8	L4	laboratoria	aktywne
7fa2b4cb-414e-4244-8a3d-6c734d380c40	EIAs6I	2026-04-28	14:30:00	90	Użytkowe pakiety programowe	dr inż. T. Makowski / mgr inż. J. Zielonka	12	Lk1I	laboratoria	aktywne
54055ed4-1186-4e0d-a705-d07096be16fc	EIAs6I	2026-04-28	16:15:00	90	Użytkowe pakiety programowe	dr inż. T. Makowski / mgr inż. J. Zielonka	A4	W	wykład	aktywne
706c4b18-5853-429d-8861-d0b8b5b798e5	EIAs6I	2026-04-28	18:00:00	90	Użytkowe pakiety programowe	dr inż. T. Makowski / mgr inż. J. Zielonka	12	Lk2I	laboratoria	aktywne
f1586753-58d9-444c-a431-8903dbae2d3e	EIAs6I	2026-04-30	07:30:00	90	Jakość energii elektrycznej	dr inż. T. Sieńko	A2	W	wykład	aktywne
41e0354d-af6c-4100-9fd1-6d1ec1cc6fc9	EIAs6I	2026-05-01	07:00:00	900	Majówka	Brak	-	Wszystkie grupy	święto	wolne
78c595d7-3554-4b71-9ae8-1792cc0ed85c	EIAs6I	2026-05-02	07:00:00	900	Majówka	Brak	-	Wszystkie grupy	święto	wolne
33b9b304-d914-4c73-90be-5ff026d39207	EIAs6I	2026-05-03	07:00:00	900	Majówka	Brak	-	Wszystkie grupy	święto	wolne
ff20730d-7d79-43db-8d0d-9fe155c1eb46	EIAs6I	2026-05-04	07:00:00	900	Majówka	Brak	-	Wszystkie grupy	święto	wolne
152f2bc1-90b2-4c66-b979-8cc37641dbd0	EIAs6I	2026-05-05	14:30:00	90	Użytkowe pakiety programowe	dr inż. T. Makowski / mgr inż. J. Zielonka	12	Lk1I	laboratoria	aktywne
e1a4b7b6-e2f4-4014-872f-2fbdd589e3d6	EIAs6I	2026-05-05	18:00:00	90	Użytkowe pakiety programowe	dr inż. T. Makowski / mgr inż. J. Zielonka	12	Lk2I	laboratoria	aktywne
6c22aef9-0c7c-416c-9092-cc6ebb6d9df2	EIAs6I	2026-05-07	07:30:00	90	Jakość energii elektrycznej	dr inż. T. Sieńko / mgr inż. D. Mamcarz	8	L3	laboratoria	aktywne
457db76c-6e64-423c-862f-5baeea8e07db	EIAs6I	2026-05-07	09:15:00	90	Jakość energii elektrycznej	dr inż. T. Sieńko / mgr inż. D. Mamcarz	8	L4	laboratoria	aktywne
20e71802-eb25-49f1-9ffd-96b5e408eaf0	EIAs6I	2026-05-12	07:00:00	900	Święto Szkoły	Brak	-	Wszystkie grupy	święto	wolne
546d59f0-a279-4816-9b98-d598374a2387	EIAs6I	2026-05-14	07:30:00	90	Jakość energii elektrycznej	dr inż. T. Sieńko	A2	W	wykład	aktywne
d948077d-5a79-4829-a3f2-c666dea132e3	EIAs6I	2026-05-19	14:30:00	90	Użytkowe pakiety programowe	dr inż. T. Makowski / mgr inż. J. Zielonka	12	Lk1I	laboratoria	aktywne
53022bdc-c7f3-4a43-ae9e-319ca7d6a211	EIAs6I	2026-05-19	18:00:00	90	Użytkowe pakiety programowe	dr inż. T. Makowski / mgr inż. J. Zielonka	12	Lk2I	laboratoria	aktywne
52cbfebb-c0a6-4694-89dc-240b2b354f1a	EIAs6I	2026-05-21	07:30:00	135	Jakość energii elektrycznej	dr inż. T. Sieńko / mgr inż. D. Mamcarz	8	L3	laboratoria	aktywne
f0e86e18-5dc6-40e5-bb09-ae07b6340d0d	EIAs6I	2026-05-21	10:00:00	135	Jakość energii elektrycznej	dr inż. T. Sieńko / mgr inż. D. Mamcarz	8	L4	laboratoria	aktywne
0159804e-748b-49df-8d97-7ee3c74a5858	EIAs6I	2026-05-24	07:00:00	900	Zielone Świątki	Brak	-	Wszystkie grupy	święto	wolne
1f56c467-222c-48b2-9a47-9e0b26495a95	EIAs6I	2026-05-26	14:30:00	90	Użytkowe pakiety programowe	dr inż. T. Makowski / mgr inż. J. Zielonka	12	Lk1I	laboratoria	aktywne
e9b4360a-b278-479d-b32e-951605981945	EIAs6I	2026-05-26	16:15:00	90	Użytkowe pakiety programowe	dr inż. T. Makowski / mgr inż. J. Zielonka	A4	W	wykład	aktywne
423a9c8c-b579-4c13-aa70-36f2dc97054b	EIAs6I	2026-05-26	18:00:00	90	Użytkowe pakiety programowe	dr inż. T. Makowski / mgr inż. J. Zielonka	12	Lk2I	laboratoria	aktywne
49ed2cce-62e6-46a3-af15-213f4be449af	EIAs6I	2026-05-28	07:30:00	90	Jakość energii elektrycznej	dr inż. T. Sieńko	A2	W	wykład	aktywne
fc63381a-9dd9-4705-abe9-0ef5b7158fe3	EIAs6I	2026-06-02	14:30:00	45	Użytkowe pakiety programowe	dr inż. T. Makowski / mgr inż. J. Zielonka	12	Lk1I	laboratoria	aktywne
310574f5-d4e2-4b83-a7ad-a84d934cb52f	EIAs6I	2026-06-02	15:15:00	45	Użytkowe pakiety programowe	dr inż. T. Makowski / mgr inż. J. Zielonka	12	Lk2I	laboratoria	aktywne
01893ced-c5fe-47c3-88d6-6aefced86eb8	EIAs6I	2026-06-04	07:00:00	900	Boże Ciało	Brak	-	Wszystkie grupy	święto	wolne
7344b435-35fa-4f1a-9478-377fcd2a560a	EIAs6I	2026-06-05	07:00:00	900	Boże Ciało	Brak	-	Wszystkie grupy	święto	wolne
fdc10d7b-a3ad-464c-acf2-2e13dd6825ab	EIAs6I	2026-06-09	16:15:00	135	Użytkowe pakiety programowe	dr inż. T. Makowski / mgr inż. J. Zielonka	A4	W	wykład	aktywne
43ac8287-c7d6-4db3-96e6-4d5097b69159	EIAs6I	2026-06-11	07:30:00	90	Jakość energii elektrycznej	dr inż. T. Sieńko	A2	W	wykład	aktywne
db4ddf32-5280-41eb-8fc8-bfb1ddaca0be	EiAs6I_EIAs6A	2026-02-23	09:15:00	90	Układy automatyki przemysłowej	prof. Ł. Ścisło	A3	W	wykład	aktywne
eef435b9-94f0-4eb4-bc89-91fc660c77aa	EiAs6I_EIAs6A	2026-02-23	11:00:00	90	Układy automatyki przemysłowej	prof. Ł. Ścisło	11	L1	laboratoria	aktywne
c19288d8-e9bd-4e0e-99b7-a3c4d498b8e8	EiAs6I_EIAs6A	2026-02-23	12:45:00	90	Układy automatyki przemysłowej	prof. Ł. Ścisło	11	L2	laboratoria	aktywne
6a02c843-a75a-4eff-a634-2f409963023d	EiAs6I_EIAs6A	2026-02-23	12:45:00	90	Bezpieczeństwo użytkowania urządzeń elektrycznych	dr inż. B. Rozegnał	8	L3	laboratoria	aktywne
4764b0ae-f8ab-4b46-a81a-da2d278ad6ce	EiAs6I_EIAs6A	2026-02-23	14:30:00	90	Układy automatyki przemysłowej	prof. Ł. Ścisło	11	L3	laboratoria	aktywne
2f7b74fd-9ec0-48d4-af24-e191c1bc769e	EiAs6I_EIAs6A	2026-02-23	14:30:00	90	Bezpieczeństwo użytkowania urządzeń elektrycznych	dr inż. B. Rozegnał	8	L2	laboratoria	aktywne
f08e598e-0537-469b-9e21-d38f4287f4c9	EiAs6I_EIAs6A	2026-02-23	16:15:00	90	Układy automatyki przemysłowej	prof. Ł. Ścisło	11	L4	laboratoria	aktywne
111e1c6b-eef2-40b9-a57f-4890b897b836	EiAs6I_EIAs6A	2026-02-23	18:00:00	90	Układy automatyki przemysłowej	prof. Ł. Ścisło	11	P1	laboratoria	aktywne
7735b60f-4f61-40b7-97fe-b93fb07cc7d2	EiAs6I_EIAs6A	2026-02-24	09:15:00	135	Pojazdy elektryczne	dr inż. W. Czuchra / dr inż. B. Woszczyna / dr inż. M. Dudzuk	b. 10-14	L3 / L4	laboratoria	aktywne
d2c98413-f89a-45ea-8658-51cd37a0b5f6	EiAs6I_EIAs6A	2026-02-24	10:00:00	90	Elektrotechnika w budownictwie	mgr inż. S. Nachman	A2	Ć1	laboratoria	aktywne
290b5300-36d3-4b39-89ba-efa604592c56	EiAs6I_EIAs6A	2026-02-24	11:45:00	135	Pojazdy elektryczne	dr inż. W. Czuchra / dr inż. B. Woszczyna / dr inż. M. Dudzuk	b. 10-14	L1 / L2	laboratoria	aktywne
9fa26eb1-a375-4b44-ac10-8749aa972392	EiAs6I_EIAs6A	2026-02-24	11:45:00	90	Elektrotechnika w budownictwie	mgr inż. S. Nachman	A2	Ć2	laboratoria	aktywne
f57bce46-28d2-4a84-94fd-d5116eef7fb8	EiAs6I_EIAs6A	2026-02-25	07:30:00	90	Prawo patentowe	dr inż. A. Drwal	A1	W	wykład	aktywne
aef6a266-d404-47d9-af9e-83df6294c790	EiAs6I_EIAs6A	2026-02-25	12:45:00	90	Podstawy kompatybilności elektromagnetycznej	dr inż. W. Czuchra	A3	W	wykład	aktywne
09985cf4-e6ae-4a77-951b-6ee99ad463b6	EiAs6I_EIAs6A	2026-02-26	11:00:00	90	Elektrotechnika w budownictwie	dr inż. B. Rozegnał / mgr inż. D. Mamcarz	8	L1	laboratoria	aktywne
11315752-3683-49bc-aac7-e16fc1449984	EiAs6I_EIAs6A	2026-02-26	14:30:00	90	Pojazdy elektryczne	dr inż. M. Dudzik	A2	W	wykład	aktywne
6b185cf1-13d8-4453-a042-6318f3ce27ac	EiAs6I_EIAs6A	2026-03-02	09:15:00	90	Układy automatyki przemysłowej	prof. Ł. Ścisło	A3	W	wykład	aktywne
bea6b2d9-fff7-45ff-98d4-0dc38d2aa69d	EiAs6I_EIAs6A	2026-03-02	11:00:00	90	Układy automatyki przemysłowej	prof. Ł. Ścisło	11	L1	laboratoria	aktywne
5cd54eb2-ab89-4f58-8b76-3bd05d968de5	EiAs6I_EIAs6A	2026-03-02	12:45:00	90	Układy automatyki przemysłowej	prof. Ł. Ścisło	11	L2	laboratoria	aktywne
16341c99-9e1b-4883-8ca3-dc76d56f360a	EiAs6I_EIAs6A	2026-03-02	12:45:00	90	Bezpieczeństwo użytkowania urządzeń elektrycznych	dr inż. B. Rozegnał	8	L4	laboratoria	aktywne
8e9fdba7-3282-43a3-81cd-5b913a671018	EiAs6I_EIAs6A	2026-03-02	14:30:00	90	Układy automatyki przemysłowej	prof. Ł. Ścisło	11	L3	laboratoria	aktywne
0253b583-2fb1-4bde-8d54-a3a1b95325b0	EiAs6I_EIAs6A	2026-03-02	14:30:00	90	Bezpieczeństwo użytkowania urządzeń elektrycznych	dr inż. B. Rozegnał	8	L1	laboratoria	aktywne
421bcc03-eb51-4655-a512-83bf5d19d7f9	EiAs6I_EIAs6A	2026-03-02	16:15:00	90	Układy automatyki przemysłowej	prof. Ł. Ścisło	11	L4	laboratoria	aktywne
7c26efc3-0d43-46a6-ac36-b624ddc2a53c	EiAs6I_EIAs6A	2026-03-02	18:00:00	90	Układy automatyki przemysłowej	prof. Ł. Ścisło	11	P2	laboratoria	aktywne
a6014e3a-81e1-4f2f-bdb8-5f9d1bf3a31f	EiAs6I_EIAs6A	2026-03-03	08:30:00	90	Napędy elektryczne	prof. P. Drozdowski / mgr inż. T. Gębarowski	013A	L2	laboratoria	aktywne
8314bfa3-b6e2-45c4-8f58-e4ee08456370	EiAs6I_EIAs6A	2026-03-03	09:30:00	135	Podstawy kompatybilności elektromagnetycznej	dr inż. W. Czuchra / dr inż. B. Woszczyna	b. 10-14	L3 / L4	laboratoria	aktywne
6c69a338-2096-4b01-899b-ce6c2af1f023	EiAs6I_EIAs6A	2026-03-03	10:15:00	90	Napędy elektryczne	prof. P. Drozdowski	A2	Ć1	laboratoria	aktywne
89799248-e263-4a05-ab22-6dc3328e51b0	EiAs6I_EIAs6A	2026-03-03	12:00:00	135	Podstawy kompatybilności elektromagnetycznej	dr inż. W. Czuchra / dr inż. B. Woszczyna	b. 10-14	L1 / L2	laboratoria	aktywne
9fe5315b-87e4-46f6-96de-63e9f21c9d69	EiAs6I_EIAs6A	2026-03-04	07:30:00	90	Prawo patentowe	dr inż. A. Drwal	A1	S1	laboratoria	aktywne
67482b84-0792-4fee-b21e-a7f93a2675d8	EiAs6I_EIAs6A	2026-03-04	09:15:00	90	Prawo patentowe	dr inż. A. Drwal	A1	P1	laboratoria	aktywne
f92d9e38-2495-489d-a909-bfa2fb57b1e1	EiAs6I_EIAs6A	2026-03-04	11:00:00	90	Prawo patentowe	dr inż. A. Drwal	A1	P2	laboratoria	aktywne
de83d4dd-0360-4219-a26d-a3100676d02e	EiAs6I_EIAs6A	2026-03-04	12:45:00	90	Napędy elektryczne	dr inż. A. Shymanska	A3	Ć2	laboratoria	aktywne
311a6fa0-1f10-43b9-b654-8698bec30d01	EiAs6I_EIAs6A	2026-03-05	09:15:00	90	Elektrotechnika w budownictwie	dr inż. B. Rozegnał / mgr inż. D. Mamcarz	8	L3	laboratoria	aktywne
e8135af3-0c7e-4622-a697-961ddfe74a7c	EiAs6I_EIAs6A	2026-03-05	09:15:00	90	Napędy elektryczne	dr inż. J. Tulicki / mgr inż. T. Gębarowski	013A	L4	laboratoria	aktywne
42630d89-0cd5-41c6-927b-5786290ff473	EiAs6I_EIAs6A	2026-03-05	11:00:00	90	Elektrotechnika w budownictwie	dr inż. B. Rozegnał / mgr inż. D. Mamcarz	8	L4	laboratoria	aktywne
50982f89-d87c-4efa-abce-1200b2a9f403	EiAs6I_EIAs6A	2026-03-05	11:00:00	90	Napędy elektryczne	dr inż. J. Tulicki / mgr inż. T. Gębarowski	013A	L1	laboratoria	aktywne
c8782a3a-0152-403a-975e-7a9d473cc7d9	EiAs6I_EIAs6A	2026-03-05	12:45:00	90	Elektrotechnika w budownictwie	dr inż. B. Rozegnał / mgr inż. D. Mamcarz	8	L2	laboratoria	aktywne
c596bc3c-f3c7-4f26-a26d-b6209b5e35ff	EiAs6I_EIAs6A	2026-03-05	12:45:00	90	Napędy elektryczne	dr inż. M. Sierżęga / mgr inż. T. Gębarowski	013A	L3	laboratoria	aktywne
4889ad16-c5f6-4294-a2db-23c0a665a96e	EiAs6I_EIAs6A	2026-03-05	14:30:00	90	Pojazdy elektryczne	dr inż. M. Dudzik	A2	W	wykład	aktywne
5f41fa06-8536-4a70-8bcd-72f883a65ddd	EiAs6I_EIAs6A	2026-03-06	08:30:00	90	Elektrotechnika w budownictwie	dr inż. Ł. Sołtysek	A4	W	wykład	aktywne
a5544180-281a-4486-9697-0d622d206d01	EiAs6I_EIAs6A	2026-03-06	13:00:00	135	Elektrotechnika w budownictwie	dr inż. Ł. Sołtysek	13	P2	laboratoria	aktywne
64b2d6b1-d078-4af0-a691-c84af651340f	EiAs6I_EIAs6A	2026-03-09	09:15:00	90	Układy automatyki przemysłowej	prof. Ł. Ścisło	A3	W	wykład	aktywne
d274ff91-60f6-4f28-8f65-82a0dec23495	EiAs6I_EIAs6A	2026-03-09	11:00:00	90	Układy automatyki przemysłowej	prof. Ł. Ścisło	11	L1	laboratoria	aktywne
40f1a4da-ea09-44de-955d-5a27100fc86c	EiAs6I_EIAs6A	2026-03-09	12:45:00	90	Układy automatyki przemysłowej	prof. Ł. Ścisło	11	L2	laboratoria	aktywne
df97fd80-724e-43d1-b8e4-9c41ea847c36	EiAs6I_EIAs6A	2026-03-09	12:45:00	90	Bezpieczeństwo użytkowania urządzeń elektrycznych	dr inż. B. Rozegnał	8	L3	laboratoria	aktywne
21dd87f6-e9f5-4ffc-8839-42f4db3f8897	EiAs6I_EIAs6A	2026-03-09	14:30:00	90	Układy automatyki przemysłowej	prof. Ł. Ścisło	11	L3	laboratoria	aktywne
6095a658-c0be-4de9-8f3f-ee648852415e	EiAs6I_EIAs6A	2026-03-09	14:30:00	90	Bezpieczeństwo użytkowania urządzeń elektrycznych	dr inż. B. Rozegnał	8	L2	laboratoria	aktywne
5fd3a95f-c1a0-41cb-ba62-3533872de81b	EiAs6I_EIAs6A	2026-03-09	16:15:00	90	Układy automatyki przemysłowej	prof. Ł. Ścisło	11	L4	laboratoria	aktywne
5ae24a21-3a18-4de1-abb8-b9abafa2bb00	EiAs6I_EIAs6A	2026-03-09	18:00:00	90	Układy automatyki przemysłowej	prof. Ł. Ścisło	11	P3	laboratoria	aktywne
f76ae9ea-81da-4515-b47b-10302308157a	EiAs6I_EIAs6A	2026-03-10	09:15:00	135	Pojazdy elektryczne	dr inż. W. Czuchra / dr inż. B. Woszczyna / dr inż. M. Dudzuk	b. 10-14	L3 / L4	laboratoria	aktywne
2c4d0ad8-333c-4142-9e8e-573eeb1e4e62	EiAs6I_EIAs6A	2026-03-10	10:00:00	90	Elektrotechnika w budownictwie	mgr inż. S. Nachman	A2	Ć1	laboratoria	aktywne
0445ccc5-6e15-49bf-9263-c7bf423340fe	EiAs6I_EIAs6A	2026-03-10	11:45:00	135	Pojazdy elektryczne	dr inż. W. Czuchra / dr inż. B. Woszczyna / dr inż. M. Dudzuk	b. 10-14	L1 / L2	laboratoria	aktywne
61d91591-0dab-4588-91c2-ec27c34c6892	EiAs6I_EIAs6A	2026-03-10	11:45:00	90	Elektrotechnika w budownictwie	mgr inż. S. Nachman	A2	Ć2	laboratoria	aktywne
c5987b00-f02c-4fed-ae73-9480b23b3ad6	EiAs6I_EIAs6A	2026-03-11	07:30:00	90	Prawo patentowe	dr inż. A. Drwal	A1	W	wykład	aktywne
60e1db5e-1c4f-429e-ad8f-12ebd9d54422	EiAs6I_EIAs6A	2026-03-11	09:15:00	90	Prawo patentowe	dr inż. A. Drwal	A1	P3	laboratoria	aktywne
67eae22d-ad91-475d-b04b-849eadab8d57	EiAs6I_EIAs6A	2026-03-11	12:45:00	90	Podstawy kompatybilności elektromagnetycznej	dr inż. W. Czuchra	A3	W	wykład	aktywne
d98502a1-0405-4783-b2cd-0d54916f2673	EiAs6I_EIAs6A	2026-03-12	11:00:00	90	Elektrotechnika w budownictwie	dr inż. B. Rozegnał / mgr inż. D. Mamcarz	8	L1	laboratoria	aktywne
97497b50-04a4-4a4c-a791-98b956a83e99	EiAs6I_EIAs6A	2026-03-12	14:30:00	90	Pojazdy elektryczne	dr inż. M. Dudzik	A2	W	wykład	aktywne
bfb93f0c-5a91-48a6-b832-99ad1bf55793	EiAs6I_EIAs6A	2026-03-13	08:30:00	90	Elektrotechnika w budownictwie	dr inż. Ł. Sołtysek	A4	W	wykład	aktywne
3262570f-b188-434e-a2bc-0878a9b9dcca	EiAs6I_EIAs6A	2026-03-13	13:00:00	90	Elektrotechnika w budownictwie	dr inż. Ł. Sołtysek	13	P3	laboratoria	aktywne
96a7e4c8-4183-4683-8568-6e511e716a1a	EiAs6I_EIAs6A	2026-03-13	14:45:00	90	Elektrotechnika w budownictwie	dr inż. Ł. Sołtysek	13	P1	laboratoria	aktywne
992a9105-0236-4391-b616-ab28ab3421c5	EiAs6I_EIAs6A	2026-03-16	09:15:00	90	Układy automatyki przemysłowej	prof. Ł. Ścisło	A3	W	wykład	aktywne
6f1104f0-6eb7-4f4e-97ad-db5e2eb6c24b	EiAs6I_EIAs6A	2026-03-16	11:00:00	90	Układy automatyki przemysłowej	prof. Ł. Ścisło	11	L1	laboratoria	aktywne
a390cd82-f46e-4deb-898c-2d2cfa0aea03	EiAs6I_EIAs6A	2026-03-16	12:45:00	90	Układy automatyki przemysłowej	prof. Ł. Ścisło	11	L2	laboratoria	aktywne
3de7fe04-75a0-45f6-a92a-209dbc8da31e	EiAs6I_EIAs6A	2026-03-16	12:45:00	90	Bezpieczeństwo użytkowania urządzeń elektrycznych	dr inż. B. Rozegnał	8	L4	laboratoria	aktywne
a5255a56-c387-4c98-b65d-e0c61fbd5d97	EiAs6I_EIAs6A	2026-03-16	14:30:00	90	Układy automatyki przemysłowej	prof. Ł. Ścisło	11	L3	laboratoria	aktywne
c9791326-fc02-4a7b-839d-d9c74035e9ba	EiAs6I_EIAs6A	2026-03-16	14:30:00	90	Bezpieczeństwo użytkowania urządzeń elektrycznych	dr inż. B. Rozegnał	8	L1	laboratoria	aktywne
f699a61c-86df-43ba-ae4b-e379190d4dfa	EiAs6I_EIAs6A	2026-03-16	16:15:00	90	Układy automatyki przemysłowej	prof. Ł. Ścisło	11	L4	laboratoria	aktywne
707c712a-2197-4d1e-8801-a4e982b378e7	EiAs6I_EIAs6A	2026-03-16	18:00:00	90	Układy automatyki przemysłowej	prof. Ł. Ścisło	11	P1	laboratoria	aktywne
6f5cfe25-b983-4d7f-be81-a17affa5b8a0	EiAs6I_EIAs6A	2026-03-17	08:30:00	90	Napędy elektryczne	prof. P. Drozdowski / mgr inż. T. Gębarowski	013A	L2	laboratoria	aktywne
335deedb-949b-4dc0-9c83-2fe500c6cf75	EiAs6I_EIAs6A	2026-03-17	09:30:00	135	Podstawy kompatybilności elektromagnetycznej	dr inż. W. Czuchra / dr inż. B. Woszczyna	b. 10-14	L3 / L4	laboratoria	aktywne
7c3f5b65-7014-4654-b21b-d40e850e4209	EiAs6I_EIAs6A	2026-03-17	10:15:00	90	Napędy elektryczne	prof. P. Drozdowski	A2	Ć1	laboratoria	aktywne
4c98a428-123a-4b6b-ba0a-54af6135f523	EiAs6I_EIAs6A	2026-03-17	12:00:00	135	Podstawy kompatybilności elektromagnetycznej	dr inż. W. Czuchra / dr inż. B. Woszczyna	b. 10-14	L1 / L2	laboratoria	aktywne
f28148b3-5ac3-4512-9253-09752bdf4604	EiAs6I_EIAs6A	2026-03-17	14:30:00	135	Bezpieczeństwo użytkowania urządzeń elektrycznych	prof. T. Węgiel	A2	W	wykład	aktywne
8ee0970c-e319-44d6-bc8e-c734a4aaea23	EiAs6I_EIAs6A	2026-03-18	07:30:00	90	Prawo patentowe	dr inż. A. Drwal	A1	S2	laboratoria	aktywne
53963cab-d666-4f83-a30c-a3001504ccd5	EiAs6I_EIAs6A	2026-03-18	09:30:00	135	Napędy elektryczne	prof. P. Drozdowski	A1	W	wykład	aktywne
83048805-2d06-4288-ac60-57e5fa581d52	EiAs6I_EIAs6A	2026-03-18	12:45:00	90	Napędy elektryczne	dr inż. A. Shymanska	A3	Ć2	laboratoria	aktywne
8669bf9e-37a3-41c5-acde-0574c31bce78	EiAs6I_EIAs6A	2026-03-18	14:30:00	90	Napędy elektryczne	prof. P. Drozdowski	13	P3	laboratoria	aktywne
6df9c843-1e9d-43d9-baed-b42bff7f8af9	EiAs6I_EIAs6A	2026-03-19	09:15:00	90	Elektrotechnika w budownictwie	dr inż. B. Rozegnał / mgr inż. D. Mamcarz	8	L3	laboratoria	aktywne
1b7353d8-1eb6-4c04-a56a-0fde1a3add25	EiAs6I_EIAs6A	2026-03-19	09:15:00	90	Napędy elektryczne	dr inż. J. Tulicki / mgr inż. T. Gębarowski	013A	L4	laboratoria	aktywne
4afe0c1e-759b-447a-9f37-21e0dd759838	EiAs6I_EIAs6A	2026-03-19	11:00:00	90	Elektrotechnika w budownictwie	dr inż. B. Rozegnał / mgr inż. D. Mamcarz	8	L4	laboratoria	aktywne
82e40f6c-03f0-41f2-99d9-5096fb5e79e5	EiAs6I_EIAs6A	2026-03-19	11:00:00	90	Napędy elektryczne	dr inż. J. Tulicki / mgr inż. T. Gębarowski	013A	L1	laboratoria	aktywne
cab6029a-96bb-4fd3-bc6a-844a640acd65	EiAs6I_EIAs6A	2026-03-19	12:45:00	90	Elektrotechnika w budownictwie	dr inż. B. Rozegnał / mgr inż. D. Mamcarz	8	L2	laboratoria	aktywne
1df417f6-1b0a-4b03-a5c1-4c3f63da9239	EiAs6I_EIAs6A	2026-03-19	12:45:00	90	Napędy elektryczne	dr inż. M. Sierżęga / mgr inż. T. Gębarowski	013A	L3	laboratoria	aktywne
11a10fda-43c9-4152-b83c-fcdd1b6f1f7a	EiAs6I_EIAs6A	2026-03-19	14:30:00	90	Pojazdy elektryczne	dr inż. M. Dudzik	A2	W	wykład	aktywne
13866b89-dbef-4095-8154-dd3534f09061	EiAs6I_EIAs6A	2026-03-20	08:30:00	90	Elektrotechnika w budownictwie	dr inż. Ł. Sołtysek	A4	W	wykład	aktywne
baec1124-4f03-4093-912f-c50112c34dca	EiAs6I_EIAs6A	2026-03-20	13:00:00	135	Elektrotechnika w budownictwie	dr inż. Ł. Sołtysek	13	P2	laboratoria	aktywne
69d93784-a8d7-4a89-9aec-b071762e3530	EiAs6I_EIAs6A	2026-03-23	09:15:00	90	Układy automatyki przemysłowej	prof. Ł. Ścisło	A3	W	wykład	aktywne
af6a5513-5323-467a-b7dd-73a6ea4ad838	EiAs6I_EIAs6A	2026-03-23	11:00:00	90	Układy automatyki przemysłowej	prof. Ł. Ścisło	11	L1	laboratoria	aktywne
bfda1316-32fc-41fa-acba-e0386fe6efe4	EiAs6I_EIAs6A	2026-03-23	12:45:00	90	Układy automatyki przemysłowej	prof. Ł. Ścisło	11	L2	laboratoria	aktywne
94a05d2c-7215-4a56-8d66-42713a492348	EiAs6I_EIAs6A	2026-03-23	12:45:00	90	Bezpieczeństwo użytkowania urządzeń elektrycznych	dr inż. B. Rozegnał	8	L3	laboratoria	aktywne
f4ad1d7f-d15f-45ea-81bf-a21a7f47db48	EiAs6I_EIAs6A	2026-03-23	14:30:00	90	Układy automatyki przemysłowej	prof. Ł. Ścisło	11	L3	laboratoria	aktywne
6bddd2cd-3ae0-4549-99b5-b71af0959820	EiAs6I_EIAs6A	2026-03-23	14:30:00	90	Bezpieczeństwo użytkowania urządzeń elektrycznych	dr inż. B. Rozegnał	8	L2	laboratoria	aktywne
e55a79f6-debd-41fa-b1ea-5958e42322f4	EiAs6I_EIAs6A	2026-03-23	16:15:00	90	Układy automatyki przemysłowej	prof. Ł. Ścisło	11	L4	laboratoria	aktywne
1bce3d13-ab72-4229-b207-4662e17a6fbe	EiAs6I_EIAs6A	2026-03-23	18:00:00	90	Układy automatyki przemysłowej	prof. Ł. Ścisło	11	P2	laboratoria	aktywne
42a38880-3fb7-46d5-a093-02895a3b7041	EiAs6I_EIAs6A	2026-03-24	09:15:00	135	Pojazdy elektryczne	dr inż. W. Czuchra / dr inż. B. Woszczyna / dr inż. M. Dudzuk	b. 10-14	L3 / L4	laboratoria	aktywne
56daa19b-ebd1-491d-badf-accf300cf96d	EiAs6I_EIAs6A	2026-03-24	10:00:00	90	Elektrotechnika w budownictwie	mgr inż. S. Nachman	A2	Ć1	laboratoria	aktywne
e2847e10-68b8-4ffe-a4d3-480421470015	EiAs6I_EIAs6A	2026-03-24	11:45:00	135	Pojazdy elektryczne	dr inż. W. Czuchra / dr inż. B. Woszczyna / dr inż. M. Dudzuk	b. 10-14	L1 / L2	laboratoria	aktywne
0213b2ba-62ee-46c7-93dc-bbf0c4d12106	EiAs6I_EIAs6A	2026-03-24	11:45:00	90	Elektrotechnika w budownictwie	mgr inż. S. Nachman	A2	Ć2	laboratoria	aktywne
047f46a5-3c31-4595-b47b-99042a8e9caf	EiAs6I_EIAs6A	2026-03-24	14:30:00	135	Bezpieczeństwo użytkowania urządzeń elektrycznych	prof. T. Węgiel	A2	W	wykład	aktywne
6ff0c3f4-969b-466d-8890-e69fa8d0fee2	EiAs6I_EIAs6A	2026-03-25	07:30:00	90	Prawo patentowe	dr inż. A. Drwal	A1	W	wykład	aktywne
279dc9cf-a273-4d59-b9b6-f3c4987c3f4e	EiAs6I_EIAs6A	2026-03-25	09:30:00	135	Napędy elektryczne	prof. P. Drozdowski	A1	W	wykład	aktywne
761bd09d-e27c-48a8-bf18-e187f47783fa	EiAs6I_EIAs6A	2026-03-25	12:45:00	90	Podstawy kompatybilności elektromagnetycznej	dr inż. W. Czuchra	A3	W	wykład	aktywne
65d7dbad-7f21-4388-ab48-ea144e673160	EiAs6I_EIAs6A	2026-03-25	14:30:00	90	Napędy elektryczne	prof. P. Drozdowski	13	P1	laboratoria	aktywne
14774c3c-b880-4d1c-b107-15ca6ea10288	EiAs6I_EIAs6A	2026-03-25	16:15:00	90	Napędy elektryczne	prof. P. Drozdowski	13	P2	laboratoria	aktywne
8ef040ab-1d6d-4fca-805e-542e79fdf2ee	EiAs6I_EIAs6A	2026-03-26	11:00:00	90	Elektrotechnika w budownictwie	dr inż. B. Rozegnał / mgr inż. D. Mamcarz	8	L1	laboratoria	aktywne
b7ad8eca-291c-419b-aab4-07c2a8d47c37	EiAs6I_EIAs6A	2026-03-26	14:30:00	90	Pojazdy elektryczne	dr inż. M. Dudzik	A2	W	wykład	aktywne
9cb82818-fe36-4f8f-9416-49a4e5de47e1	EiAs6I_EIAs6A	2026-03-27	08:30:00	90	Elektrotechnika w budownictwie	dr inż. Ł. Sołtysek	A4	W	wykład	aktywne
0d3b358b-181d-482c-9050-e0d1130cc9d0	EiAs6I_EIAs6A	2026-03-27	13:00:00	90	Elektrotechnika w budownictwie	dr inż. Ł. Sołtysek	13	P3	laboratoria	aktywne
8de59e51-0c63-424d-bc86-6502b6e14297	EiAs6I_EIAs6A	2026-03-27	14:45:00	90	Elektrotechnika w budownictwie	dr inż. Ł. Sołtysek	13	P1	laboratoria	aktywne
5a840342-be0b-4957-8512-fec4d9c03541	EiAs6I_EIAs6A	2026-03-30	09:15:00	90	Układy automatyki przemysłowej	prof. Ł. Ścisło	A3	W	wykład	aktywne
2a73c7a8-2f85-46d0-a7dd-b933e380ecd0	EiAs6I_EIAs6A	2026-03-30	11:00:00	90	Układy automatyki przemysłowej	prof. Ł. Ścisło	11	L1	laboratoria	aktywne
d45f2b58-32df-48ac-853f-fb2eb588ee4f	EiAs6I_EIAs6A	2026-03-30	12:45:00	90	Układy automatyki przemysłowej	prof. Ł. Ścisło	11	L2	laboratoria	aktywne
e4b976e7-e616-4b06-b1f8-af36098dcd4a	EiAs6I_EIAs6A	2026-03-30	12:45:00	90	Bezpieczeństwo użytkowania urządzeń elektrycznych	dr inż. B. Rozegnał	8	L4	laboratoria	aktywne
1470888a-8cce-405f-a87f-85f146d30f99	EiAs6I_EIAs6A	2026-03-30	14:30:00	90	Układy automatyki przemysłowej	prof. Ł. Ścisło	11	L3	laboratoria	aktywne
fa024c24-5e12-43d9-8246-c70d2fb54676	EiAs6I_EIAs6A	2026-03-30	14:30:00	90	Bezpieczeństwo użytkowania urządzeń elektrycznych	dr inż. B. Rozegnał	8	L1	laboratoria	aktywne
7479e6a1-ee2a-44a4-b3cc-e2696e14241d	EiAs6I_EIAs6A	2026-03-30	16:15:00	90	Układy automatyki przemysłowej	prof. Ł. Ścisło	11	L4	laboratoria	aktywne
809b9d27-2496-448a-bc5f-0ee2c89e0c93	EiAs6I_EIAs6A	2026-03-30	18:00:00	90	Układy automatyki przemysłowej	prof. Ł. Ścisło	11	P3	laboratoria	aktywne
a57976e9-c632-4a37-ac08-3b52557342fb	EiAs6I_EIAs6A	2026-03-31	08:30:00	90	Napędy elektryczne	prof. P. Drozdowski / mgr inż. T. Gębarowski	013A	L2	laboratoria	aktywne
1cf61cd1-a286-4f03-91df-7ec2169d3f52	EiAs6I_EIAs6A	2026-03-31	09:30:00	135	Podstawy kompatybilności elektromagnetycznej	dr inż. W. Czuchra / dr inż. B. Woszczyna	b. 10-14	L3 / L4	laboratoria	aktywne
34110d19-fcd2-4d6f-9632-acf9dd9d4d89	EiAs6I_EIAs6A	2026-03-31	10:15:00	90	Napędy elektryczne	prof. P. Drozdowski	A2	Ć1	laboratoria	aktywne
78bc0cd2-581f-41a4-a34b-a77888d38bbd	EiAs6I_EIAs6A	2026-03-31	12:00:00	135	Podstawy kompatybilności elektromagnetycznej	dr inż. W. Czuchra / dr inż. B. Woszczyna	b. 10-14	L1 / L2	laboratoria	aktywne
2965a060-c8ff-4fc1-9fab-feb523513182	EiAs6I_EIAs6A	2026-03-31	14:30:00	135	Bezpieczeństwo użytkowania urządzeń elektrycznych	prof. T. Węgiel	A2	W	wykład	aktywne
e014d2d7-8db1-474e-b0b8-ce23cd3566ed	EiAs6I_EIAs6A	2026-04-01	07:00:00	900	Przerwa świąteczna	Brak	-	Wszystkie grupy	święto	wolne
c98dc693-dd53-4e28-a07e-0e7484cda047	EiAs6I_EIAs6A	2026-04-02	07:00:00	900	Przerwa świąteczna	Brak	-	Wszystkie grupy	święto	wolne
2cb13930-6a76-45d2-9a76-626823855ce5	EiAs6I_EIAs6A	2026-04-03	07:00:00	900	Przerwa świąteczna	Brak	-	Wszystkie grupy	święto	wolne
65f3ad17-8ba1-435d-85c1-2545d1ba6892	EiAs6I_EIAs6A	2026-04-04	07:00:00	900	Przerwa świąteczna	Brak	-	Wszystkie grupy	święto	wolne
d650829d-0b98-49c0-82a1-2da8bc0d5483	EiAs6I_EIAs6A	2026-04-05	07:00:00	900	Przerwa świąteczna	Brak	-	Wszystkie grupy	święto	wolne
d81e57b6-d8b1-4e8c-9d59-f9729462014d	EiAs6I_EIAs6A	2026-04-06	07:00:00	900	Przerwa świąteczna	Brak	-	Wszystkie grupy	święto	wolne
ab136d65-2888-4e35-bacf-39874bfcf36d	EiAs6I_EIAs6A	2026-04-07	07:00:00	900	Przerwa świąteczna	Brak	-	Wszystkie grupy	święto	wolne
f4d66b21-e260-4b8e-bfd4-12c52f180df0	EiAs6I_EIAs6A	2026-04-08	07:30:00	90	Prawo patentowe	dr inż. A. Drwal	A1	W	wykład	aktywne
4b423b00-a7a3-40c3-858b-822fdca1aa3c	EiAs6I_EIAs6A	2026-04-08	09:30:00	135	Napędy elektryczne	prof. P. Drozdowski	A1	W	wykład	aktywne
deedde00-f4e3-4d7b-a0b2-2e90273e0801	EiAs6I_EIAs6A	2026-04-08	12:45:00	90	Podstawy kompatybilności elektromagnetycznej	dr inż. W. Czuchra	A3	W	wykład	aktywne
465d2563-04b5-44d5-a0e6-0d89983d7883	EiAs6I_EIAs6A	2026-04-08	14:30:00	90	Napędy elektryczne	prof. P. Drozdowski	13	P1	laboratoria	aktywne
b60c402c-57e7-484d-bd17-09066500bd40	EiAs6I_EIAs6A	2026-04-08	16:15:00	90	Napędy elektryczne	prof. P. Drozdowski	13	P2	laboratoria	aktywne
4ed5eb36-250c-4d2b-9516-015416c6bdee	EiAs6I_EIAs6A	2026-04-09	11:00:00	90	Elektrotechnika w budownictwie	dr inż. B. Rozegnał / mgr inż. D. Mamcarz	8	L1	laboratoria	aktywne
0ff5e841-df1b-4aab-a176-20407b527c51	EiAs6I_EIAs6A	2026-04-09	14:30:00	90	Pojazdy elektryczne	dr inż. M. Dudzik	A2	W	wykład	aktywne
6310dac9-603e-4b07-bbb6-7460ec0ded06	EiAs6I_EIAs6A	2026-04-10	08:30:00	90	Elektrotechnika w budownictwie	dr inż. Ł. Sołtysek	A4	W	wykład	aktywne
6996ce4e-68b8-445f-ad6c-698331cd7fed	EiAs6I_EIAs6A	2026-04-10	13:00:00	90	Elektrotechnika w budownictwie	dr inż. Ł. Sołtysek	13	P3	laboratoria	aktywne
870f0bd0-8a31-48d4-b24a-0603e0059025	EiAs6I_EIAs6A	2026-04-10	14:45:00	90	Elektrotechnika w budownictwie	dr inż. Ł. Sołtysek	13	P1	laboratoria	aktywne
ce05c4b8-df5c-4da2-9d7b-f5588141a9f2	EiAs6I_EIAs6A	2026-04-13	09:15:00	90	Układy automatyki przemysłowej	prof. Ł. Ścisło	A3	W	wykład	aktywne
074cedb5-65c7-4c52-b380-7b6b5ccdabd1	EiAs6I_EIAs6A	2026-04-13	11:00:00	90	Układy automatyki przemysłowej	prof. Ł. Ścisło	11	L1	laboratoria	aktywne
7f8e387b-54a4-446b-8962-677cfb9e9ed2	EiAs6I_EIAs6A	2026-04-13	12:45:00	90	Układy automatyki przemysłowej	prof. Ł. Ścisło	11	L2	laboratoria	aktywne
d0a07df3-6487-41a7-a0be-c0c19133c379	EiAs6I_EIAs6A	2026-04-13	12:45:00	90	Bezpieczeństwo użytkowania urządzeń elektrycznych	dr inż. B. Rozegnał	8	L4	laboratoria	aktywne
4c21a7fc-16d2-425b-87cd-cfe0c307ef54	EiAs6I_EIAs6A	2026-04-13	14:30:00	90	Układy automatyki przemysłowej	prof. Ł. Ścisło	11	L3	laboratoria	aktywne
6d206d7b-d47c-4ff0-8f6a-015818ae473e	EiAs6I_EIAs6A	2026-04-13	14:30:00	90	Bezpieczeństwo użytkowania urządzeń elektrycznych	dr inż. B. Rozegnał	8	L1	laboratoria	aktywne
c5f37d68-55ca-45da-b7aa-dc32ddab2687	EiAs6I_EIAs6A	2026-04-13	16:15:00	90	Układy automatyki przemysłowej	prof. Ł. Ścisło	11	L4	laboratoria	aktywne
bc22c12e-5830-40de-b7ce-685afe224c70	EiAs6I_EIAs6A	2026-04-13	18:00:00	90	Układy automatyki przemysłowej	prof. Ł. Ścisło	11	P2	laboratoria	aktywne
1362c911-4a9e-48da-af25-b28bee8de40c	EiAs6I_EIAs6A	2026-04-14	08:30:00	90	Napędy elektryczne	prof. P. Drozdowski / mgr inż. T. Gębarowski	013A	L2	laboratoria	aktywne
8da52ef3-7f4c-4c9d-a164-c9f1386a856a	EiAs6I_EIAs6A	2026-04-14	09:30:00	135	Podstawy kompatybilności elektromagnetycznej	dr inż. W. Czuchra / dr inż. B. Woszczyna	b. 10-14	L3 / L4	laboratoria	aktywne
072f9fd9-96d3-4ab4-af88-86759bf53b3e	EiAs6I_EIAs6A	2026-04-14	10:15:00	90	Napędy elektryczne	prof. P. Drozdowski	A2	Ć1	laboratoria	aktywne
7913e0a3-5d4d-4cf6-a3c2-010592eb978c	EiAs6I_EIAs6A	2026-04-14	12:00:00	135	Podstawy kompatybilności elektromagnetycznej	dr inż. W. Czuchra / dr inż. B. Woszczyna	b. 10-14	L1 / L2	laboratoria	aktywne
362cee31-93b0-4a30-a67b-8c009a18c97c	EiAs6I_EIAs6A	2026-04-15	07:30:00	90	Prawo patentowe	dr inż. A. Drwal	A1	S2	laboratoria	aktywne
6cbbe54b-e241-4ea5-8a76-40e3a9ed0ea5	EiAs6I_EIAs6A	2026-04-15	09:30:00	135	Napędy elektryczne	prof. P. Drozdowski	A1	W	wykład	aktywne
bf1dfe48-f7a1-4597-90b3-eae3bfcc3573	Erasmus	2026-04-01	07:00:00	900	Przerwa świąteczna	Brak	-	Wszystkie grupy	święto	wolne
21336557-c9d3-429d-9529-d6647f4d891c	EiAs6I_EIAs6A	2026-04-15	12:45:00	90	Napędy elektryczne	dr inż. A. Shymanska	A3	Ć2	laboratoria	aktywne
5f5be74f-b3ed-4c44-8388-f48ae120dc06	EiAs6I_EIAs6A	2026-04-15	14:30:00	90	Napędy elektryczne	prof. P. Drozdowski	13	P3	laboratoria	aktywne
923a287a-e039-40a9-99f2-2429f168591b	EiAs6I_EIAs6A	2026-04-16	09:15:00	90	Elektrotechnika w budownictwie	dr inż. B. Rozegnał / mgr inż. D. Mamcarz	8	L3	laboratoria	aktywne
3c84864d-da54-4281-8cce-3681c8f27e99	EiAs6I_EIAs6A	2026-04-16	09:15:00	90	Napędy elektryczne	dr inż. J. Tulicki / mgr inż. T. Gębarowski	013A	L4	laboratoria	aktywne
e7769447-82d8-459c-84a3-e42ad66d20b7	EiAs6I_EIAs6A	2026-04-16	11:00:00	90	Elektrotechnika w budownictwie	dr inż. B. Rozegnał / mgr inż. D. Mamcarz	8	L4	laboratoria	aktywne
d5090366-cd90-40d3-9153-bdbbcde0c9cf	EiAs6I_EIAs6A	2026-04-16	11:00:00	90	Napędy elektryczne	dr inż. J. Tulicki / mgr inż. T. Gębarowski	013A	L1	laboratoria	aktywne
6b05f08d-780a-401f-beba-90824073dca3	EiAs6I_EIAs6A	2026-04-16	12:45:00	90	Elektrotechnika w budownictwie	dr inż. B. Rozegnał / mgr inż. D. Mamcarz	8	L2	laboratoria	aktywne
7bb8ae6b-d762-48a6-a63c-230fa67941e9	EiAs6I_EIAs6A	2026-04-16	12:45:00	90	Napędy elektryczne	dr inż. M. Sierżęga / mgr inż. T. Gębarowski	013A	L3	laboratoria	aktywne
c7041df2-2ae7-4fb3-ab46-90c91dfbbf66	EiAs6I_EIAs6A	2026-04-16	14:30:00	90	Pojazdy elektryczne	dr inż. M. Dudzik	A2	W	wykład	aktywne
08467063-a19a-4b9d-b319-ff81c97a2ca9	EiAs6I_EIAs6A	2026-04-17	08:30:00	90	Elektrotechnika w budownictwie	dr inż. Ł. Sołtysek	A4	W	wykład	aktywne
856811bb-5051-4a6e-bb14-6eb0120b1f5a	EiAs6I_EIAs6A	2026-04-17	13:00:00	135	Elektrotechnika w budownictwie	dr inż. Ł. Sołtysek	13	P2	laboratoria	aktywne
8ab1c774-19ca-4518-9682-c1910597a909	EiAs6I_EIAs6A	2026-04-20	09:15:00	90	Układy automatyki przemysłowej	prof. Ł. Ścisło	A3	W	wykład	aktywne
979fa0ee-1adf-4ff8-b322-8bc7270593b0	EiAs6I_EIAs6A	2026-04-20	11:00:00	90	Układy automatyki przemysłowej	prof. Ł. Ścisło	11	L1	laboratoria	aktywne
a194030c-3851-45cc-a00d-20fdfdd5043a	EiAs6I_EIAs6A	2026-04-20	12:45:00	90	Układy automatyki przemysłowej	prof. Ł. Ścisło	11	L2	laboratoria	aktywne
693505c2-7700-453b-abe8-df2bb3aa705f	EiAs6I_EIAs6A	2026-04-20	12:45:00	90	Bezpieczeństwo użytkowania urządzeń elektrycznych	dr inż. B. Rozegnał	8	L3	laboratoria	aktywne
20f6a4b9-d4ea-4871-bce2-983ae50a3404	EiAs6I_EIAs6A	2026-04-20	14:30:00	90	Układy automatyki przemysłowej	prof. Ł. Ścisło	11	L3	laboratoria	aktywne
8a592fa4-0b99-49b7-a057-c346604859ae	EiAs6I_EIAs6A	2026-04-20	14:30:00	90	Bezpieczeństwo użytkowania urządzeń elektrycznych	dr inż. B. Rozegnał	8	L2	laboratoria	aktywne
e26c2aa1-6e58-49c0-8c3a-12a5ed73a4fe	EiAs6I_EIAs6A	2026-04-20	16:15:00	90	Układy automatyki przemysłowej	prof. Ł. Ścisło	11	L4	laboratoria	aktywne
49c11753-adab-4f15-aced-3eadc0e2e3e1	EiAs6I_EIAs6A	2026-04-20	18:00:00	90	Układy automatyki przemysłowej	prof. Ł. Ścisło	11	P3	laboratoria	aktywne
0cb5330b-a517-4332-9db5-2fc05822d8a7	EiAs6I_EIAs6A	2026-04-21	09:15:00	135	Pojazdy elektryczne	dr inż. W. Czuchra / dr inż. B. Woszczyna / dr inż. M. Dudzuk	b. 10-14	L3 / L4	laboratoria	aktywne
bb036dd9-df7b-4689-ad10-420f05d3f4f3	EiAs6I_EIAs6A	2026-04-21	10:00:00	90	Elektrotechnika w budownictwie	mgr inż. S. Nachman	A2	Ć1	laboratoria	aktywne
0e9278da-361d-4c66-b7f1-e5744c6c44c8	EiAs6I_EIAs6A	2026-04-21	11:45:00	135	Pojazdy elektryczne	dr inż. W. Czuchra / dr inż. B. Woszczyna / dr inż. M. Dudzuk	b. 10-14	L1 / L2	laboratoria	aktywne
4746d948-2aa0-4047-b5bc-653328b78045	EiAs6I_EIAs6A	2026-04-21	11:45:00	90	Elektrotechnika w budownictwie	mgr inż. S. Nachman	A2	Ć2	laboratoria	aktywne
59357f70-0ea0-4b46-b74d-5f2804fc15f2	EiAs6I_EIAs6A	2026-04-22	07:30:00	90	Prawo patentowe	dr inż. A. Drwal	A1	W	wykład	aktywne
0d96bf8f-222f-4293-abf2-ecad1fa95f44	EiAs6I_EIAs6A	2026-04-22	09:30:00	135	Napędy elektryczne	prof. P. Drozdowski	A1	W	wykład	aktywne
e5960c78-0f65-44b2-bd0e-36eb108ffa1a	EiAs6I_EIAs6A	2026-04-22	12:45:00	90	Podstawy kompatybilności elektromagnetycznej	dr inż. W. Czuchra	A3	W	wykład	aktywne
42238f0e-1fc2-494b-8279-506e1144320b	EiAs6I_EIAs6A	2026-04-22	14:30:00	90	Napędy elektryczne	prof. P. Drozdowski	13	P1	laboratoria	aktywne
422a9c66-28d6-41bd-8f02-39249c456727	EiAs6I_EIAs6A	2026-04-22	16:15:00	90	Napędy elektryczne	prof. P. Drozdowski	13	P2	laboratoria	aktywne
cedd66c0-083f-4bbc-bb6a-c59fd5aafc5b	EiAs6I_EIAs6A	2026-04-23	11:00:00	90	Elektrotechnika w budownictwie	dr inż. B. Rozegnał / mgr inż. D. Mamcarz	8	L1	laboratoria	aktywne
88371fa7-e9e8-4c72-a341-06d6ec9b7fd1	EiAs6I_EIAs6A	2026-04-23	14:30:00	90	Pojazdy elektryczne	dr inż. M. Dudzik	A2	W	wykład	aktywne
0d39384f-86a8-4db4-85cc-1cc9782a9f4b	EiAs6I_EIAs6A	2026-04-24	08:30:00	90	Elektrotechnika w budownictwie	dr inż. Ł. Sołtysek	A4	W	wykład	aktywne
e333024f-2640-43a1-9004-ff8ca27556f5	EiAs6I_EIAs6A	2026-04-24	13:00:00	90	Elektrotechnika w budownictwie	dr inż. Ł. Sołtysek	13	P3	laboratoria	aktywne
fcac63dc-0cf7-413f-a71b-9a86f24a3242	EiAs6I_EIAs6A	2026-04-24	14:45:00	90	Elektrotechnika w budownictwie	dr inż. Ł. Sołtysek	13	P1	laboratoria	aktywne
e6e53cc1-bdf7-4f54-97b0-2a3d74cef2a7	EiAs6I_EIAs6A	2026-04-27	09:15:00	90	Układy automatyki przemysłowej	prof. Ł. Ścisło	A3	W	wykład	aktywne
28801aa5-f994-4f14-ae04-ee7f7bb0994e	EiAs6I_EIAs6A	2026-04-27	11:00:00	90	Układy automatyki przemysłowej	prof. Ł. Ścisło	11	L1	laboratoria	aktywne
0ed9666c-55b3-488d-8705-e45aeaaf7b5d	EiAs6I_EIAs6A	2026-04-27	12:45:00	90	Układy automatyki przemysłowej	prof. Ł. Ścisło	11	L2	laboratoria	aktywne
eaeb6d1d-8359-4281-a03f-e32182c1b555	EiAs6I_EIAs6A	2026-04-27	12:45:00	90	Bezpieczeństwo użytkowania urządzeń elektrycznych	dr inż. B. Rozegnał	8	L4	laboratoria	aktywne
eb746a3f-b37b-4d97-b9d0-8aa1bdde1572	EiAs6I_EIAs6A	2026-04-27	14:30:00	90	Układy automatyki przemysłowej	prof. Ł. Ścisło	11	L3	laboratoria	aktywne
02f14620-cb20-4856-a311-93dde78a7e5d	EiAs6I_EIAs6A	2026-04-27	14:30:00	90	Bezpieczeństwo użytkowania urządzeń elektrycznych	dr inż. B. Rozegnał	8	L1	laboratoria	aktywne
7ab55b7d-27eb-4056-9c79-8cd24df5e6a6	EiAs6I_EIAs6A	2026-04-27	16:15:00	90	Układy automatyki przemysłowej	prof. Ł. Ścisło	11	L4	laboratoria	aktywne
ab24885f-8b13-44f8-85b7-9b4bcf69887b	EiAs6I_EIAs6A	2026-04-27	18:00:00	90	Układy automatyki przemysłowej	prof. Ł. Ścisło	11	P1	laboratoria	aktywne
454f1905-23c7-4e62-849d-875fb088f5bd	EiAs6I_EIAs6A	2026-04-28	08:30:00	90	Napędy elektryczne	prof. P. Drozdowski / mgr inż. T. Gębarowski	013A	L2	laboratoria	aktywne
ff758755-0a24-40d4-b436-18ab2dad8a2a	EiAs6I_EIAs6A	2026-04-28	09:30:00	135	Podstawy kompatybilności elektromagnetycznej	dr inż. W. Czuchra / dr inż. B. Woszczyna	b. 10-14	L3 / L4	laboratoria	aktywne
b199a656-3fbf-4a07-a596-eaaf4d794515	EiAs6I_EIAs6A	2026-04-28	10:15:00	90	Napędy elektryczne	prof. P. Drozdowski	A2	Ć1	laboratoria	aktywne
aa3c226f-ff35-42b3-938f-fe1e0cc76a5f	EiAs6I_EIAs6A	2026-04-28	12:00:00	135	Podstawy kompatybilności elektromagnetycznej	dr inż. W. Czuchra / dr inż. B. Woszczyna	b. 10-14	L1 / L2	laboratoria	aktywne
7695e321-f127-43ae-910f-015835ff209d	EiAs6I_EIAs6A	2026-04-29	07:30:00	90	Prawo patentowe	dr inż. A. Drwal	A1	S1	laboratoria	aktywne
a0fe31a3-d48e-462e-afa6-46f3de5d6a36	EiAs6I_EIAs6A	2026-04-29	09:30:00	135	Napędy elektryczne	prof. P. Drozdowski	A1	W	wykład	aktywne
c787beef-2ce2-4f83-b22e-d818b2e1e448	EiAs6I_EIAs6A	2026-04-29	12:45:00	90	Napędy elektryczne	dr inż. A. Shymanska	A3	Ć2	laboratoria	aktywne
ef824230-36bc-45df-8930-64229df394be	EiAs6I_EIAs6A	2026-04-29	14:30:00	90	Napędy elektryczne	prof. P. Drozdowski	13	P3	laboratoria	aktywne
b7f6606c-8b60-4e9c-8261-1d80ec98b2d9	EiAs6I_EIAs6A	2026-04-30	09:15:00	90	Elektrotechnika w budownictwie	dr inż. B. Rozegnał / mgr inż. D. Mamcarz	8	L3	laboratoria	aktywne
6ae15240-958e-4663-b5e1-11a0cde0b319	EiAs6I_EIAs6A	2026-04-30	09:15:00	90	Napędy elektryczne	dr inż. J. Tulicki / mgr inż. T. Gębarowski	013A	L4	laboratoria	aktywne
291d9057-4618-4aaa-bf78-3d37c7d2b9f6	EiAs6I_EIAs6A	2026-04-30	11:00:00	90	Elektrotechnika w budownictwie	dr inż. B. Rozegnał / mgr inż. D. Mamcarz	8	L4	laboratoria	aktywne
e6182f6a-41d9-4916-9506-4e519dfa0811	EiAs6I_EIAs6A	2026-04-30	11:00:00	90	Napędy elektryczne	dr inż. J. Tulicki / mgr inż. T. Gębarowski	013A	L1	laboratoria	aktywne
0051b798-c88b-4296-90aa-04dbf0ae0452	EiAs6I_EIAs6A	2026-04-30	12:45:00	90	Elektrotechnika w budownictwie	dr inż. B. Rozegnał / mgr inż. D. Mamcarz	8	L2	laboratoria	aktywne
128c1541-7d95-45bf-8ebc-aa2fe527eab8	EiAs6I_EIAs6A	2026-04-30	12:45:00	90	Napędy elektryczne	dr inż. M. Sierżęga / mgr inż. T. Gębarowski	013A	L3	laboratoria	aktywne
970b58cb-6751-4f2a-b35d-8937d7459da0	EiAs6I_EIAs6A	2026-04-30	14:30:00	90	Pojazdy elektryczne	dr inż. M. Dudzik	A2	W	wykład	aktywne
1c3720d1-abbb-4270-8282-8c7a2b7ce02e	EiAs6I_EIAs6A	2026-05-01	07:00:00	900	Majówka	Brak	-	Wszystkie grupy	święto	wolne
c79035c6-e24b-4eeb-a67d-3f9b4bada4fe	EiAs6I_EIAs6A	2026-05-02	07:00:00	900	Majówka	Brak	-	Wszystkie grupy	święto	wolne
0f19a6e5-7590-4d24-beba-4de380e5d3e1	EiAs6I_EIAs6A	2026-05-03	07:00:00	900	Majówka	Brak	-	Wszystkie grupy	święto	wolne
4bcf06ef-cfbf-4af3-b997-103a4e220b74	EiAs6I_EIAs6A	2026-05-04	07:00:00	900	Majówka	Brak	-	Wszystkie grupy	święto	wolne
54e7d0de-872e-4078-a858-bae293d1ccd3	EiAs6I_EIAs6A	2026-05-05	09:15:00	135	Pojazdy elektryczne	dr inż. W. Czuchra / dr inż. B. Woszczyna / dr inż. M. Dudzuk	b. 10-14	L3 / L4	laboratoria	aktywne
14a45d53-9cb7-480d-9847-3077aea184a1	EiAs6I_EIAs6A	2026-05-05	10:00:00	90	Elektrotechnika w budownictwie	mgr inż. S. Nachman	A2	Ć1	laboratoria	aktywne
219c01e9-9e1c-438e-a9d4-88b8979701ba	EiAs6I_EIAs6A	2026-05-05	11:45:00	135	Pojazdy elektryczne	dr inż. W. Czuchra / dr inż. B. Woszczyna / dr inż. M. Dudzuk	b. 10-14	L1 / L2	laboratoria	aktywne
a50f7627-270a-43ca-935a-9b2071209ecd	EiAs6I_EIAs6A	2026-05-05	11:45:00	90	Elektrotechnika w budownictwie	mgr inż. S. Nachman	A2	Ć2	laboratoria	aktywne
964715a9-7d95-4ac4-bb9b-a4a93b359d2d	EiAs6I_EIAs6A	2026-05-06	07:30:00	90	Prawo patentowe	dr inż. A. Drwal	A1	W	wykład	aktywne
9b23c23d-8fc1-4a78-b270-4ecbe4d2d85a	EiAs6I_EIAs6A	2026-05-06	09:30:00	135	Napędy elektryczne	prof. P. Drozdowski	A1	W	wykład	aktywne
ece2c4b4-6200-4efb-b0e2-e8748fb37517	EiAs6I_EIAs6A	2026-05-06	13:45:00	135	Napędy elektryczne	prof. P. Drozdowski	13	P1	laboratoria	aktywne
d5df6c14-fbb2-4d03-ac66-dbf1d4fc59c7	EiAs6I_EIAs6A	2026-05-06	16:15:00	135	Napędy elektryczne	prof. P. Drozdowski	13	P2	laboratoria	aktywne
361c7fcb-fed2-4dd2-b0cd-d84473a63b9c	EiAs6I_EIAs6A	2026-05-07	11:00:00	90	Elektrotechnika w budownictwie	dr inż. B. Rozegnał / mgr inż. D. Mamcarz	8	L1	laboratoria	aktywne
462a5bf1-64c5-4755-88a9-3ef6d4788510	EiAs6I_EIAs6A	2026-05-07	14:30:00	90	Pojazdy elektryczne	dr inż. M. Dudzik	A2	W	wykład	aktywne
b65b7ffe-1ad6-4e05-9a0f-29b8e6663d88	EiAs6I_EIAs6A	2026-05-08	08:30:00	90	Elektrotechnika w budownictwie	dr inż. Ł. Sołtysek	A4	W	wykład	aktywne
da898d67-9ccd-435a-9986-4fbf81576a59	EiAs6I_EIAs6A	2026-05-08	13:00:00	90	Elektrotechnika w budownictwie	dr inż. Ł. Sołtysek	13	P3	laboratoria	aktywne
f92d683a-28b0-4d9f-b7cd-5505b3770ea0	EiAs6I_EIAs6A	2026-05-08	14:45:00	90	Elektrotechnika w budownictwie	dr inż. Ł. Sołtysek	13	P1	laboratoria	aktywne
f13bddbb-60f0-49d4-8f07-df18085a0f8e	EiAs6I_EIAs6A	2026-05-11	09:15:00	90	Układy automatyki przemysłowej	prof. Ł. Ścisło	A3	W	wykład	aktywne
f3c61054-f145-4761-b080-56ebee74a5b4	EiAs6I_EIAs6A	2026-05-11	11:00:00	90	Układy automatyki przemysłowej	prof. Ł. Ścisło	11	L1	laboratoria	aktywne
ae1df1d3-adc8-4258-b78e-504a0d41c3c5	EiAs6I_EIAs6A	2026-05-11	12:45:00	90	Układy automatyki przemysłowej	prof. Ł. Ścisło	11	L2	laboratoria	aktywne
248426bc-49e1-4e38-887c-8d3c11adb3d0	EiAs6I_EIAs6A	2026-05-11	12:45:00	90	Bezpieczeństwo użytkowania urządzeń elektrycznych	dr inż. B. Rozegnał	8	L4	laboratoria	aktywne
cab68f10-9050-4792-82d0-0c0828ffd40c	EiAs6I_EIAs6A	2026-05-11	14:30:00	90	Układy automatyki przemysłowej	prof. Ł. Ścisło	11	L3	laboratoria	aktywne
6de3df88-fd54-4dce-8e1c-de40fba437e5	EiAs6I_EIAs6A	2026-05-11	14:30:00	90	Bezpieczeństwo użytkowania urządzeń elektrycznych	dr inż. B. Rozegnał	8	L1	laboratoria	aktywne
d18523af-4607-4b4c-8a65-831f0a5ad265	EiAs6I_EIAs6A	2026-05-11	16:15:00	90	Układy automatyki przemysłowej	prof. Ł. Ścisło	11	L4	laboratoria	aktywne
4469669c-839a-450a-9cbe-3e2e0e8223ff	EiAs6I_EIAs6A	2026-05-11	18:00:00	90	Układy automatyki przemysłowej	prof. Ł. Ścisło	11	P3	laboratoria	aktywne
26a462d7-67d0-4ad7-b487-1b309fce6350	EiAs6I_EIAs6A	2026-05-12	07:00:00	900	Święto Szkoły	Brak	-	Wszystkie grupy	święto	wolne
51966a8d-a45d-4ffc-a596-274336db2357	EiAs6I_EIAs6A	2026-05-13	07:30:00	90	Prawo patentowe	dr inż. A. Drwal	A1	S1 / S2	laboratoria	aktywne
b3afbbda-a725-42c5-8446-3aef36bc19e2	EiAs6I_EIAs6A	2026-05-13	09:30:00	135	Napędy elektryczne	prof. P. Drozdowski	A1	W	wykład	aktywne
e1e5fa17-1f0a-45e2-a612-808fecbb1e9d	EiAs6I_EIAs6A	2026-05-13	12:45:00	90	Napędy elektryczne	dr inż. A. Shymanska	A3	Ć2	laboratoria	aktywne
ea5d633e-3f0b-4961-b605-db9c41ec4c1e	EiAs6I_EIAs6A	2026-05-13	14:30:00	135	Napędy elektryczne	prof. P. Drozdowski	13	P3	laboratoria	aktywne
f776ecca-2f01-4a59-b5ce-6bd7df752f36	EiAs6I_EIAs6A	2026-05-14	09:15:00	90	Elektrotechnika w budownictwie	dr inż. B. Rozegnał / mgr inż. D. Mamcarz	8	L3	laboratoria	aktywne
65f8765e-f403-4ba0-bfc1-1a5d3a0d0487	EiAs6I_EIAs6A	2026-05-14	09:15:00	90	Napędy elektryczne	dr inż. J. Tulicki / mgr inż. T. Gębarowski	013A	L4	laboratoria	aktywne
e6811e89-0c83-426a-b0a6-96ed47c206f9	EiAs6I_EIAs6A	2026-05-14	11:00:00	90	Elektrotechnika w budownictwie	dr inż. B. Rozegnał / mgr inż. D. Mamcarz	8	L4	laboratoria	aktywne
c8515001-4db8-4a5e-a1b4-18d5dec653f7	EiAs6I_EIAs6A	2026-05-14	11:00:00	90	Napędy elektryczne	dr inż. J. Tulicki / mgr inż. T. Gębarowski	013A	L1	laboratoria	aktywne
8d4c047a-a107-4cec-ad8d-c94b11c6ca0e	EiAs6I_EIAs6A	2026-05-14	12:45:00	90	Elektrotechnika w budownictwie	dr inż. B. Rozegnał / mgr inż. D. Mamcarz	8	L2	laboratoria	aktywne
dbc6ac2f-0354-4a93-8e8c-604b9a8cdf6a	EiAs6I_EIAs6A	2026-05-14	12:45:00	90	Napędy elektryczne	dr inż. M. Sierżęga / mgr inż. T. Gębarowski	013A	L3	laboratoria	aktywne
6a80c8e6-099a-4a1a-9e6c-b0f14d5f9c59	EiAs6I_EIAs6A	2026-05-15	08:30:00	90	Elektrotechnika w budownictwie	dr inż. Ł. Sołtysek	A4	W	wykład	aktywne
d3643ee4-2290-488e-898e-3d60dba9a5f5	EiAs6I_EIAs6A	2026-05-15	13:00:00	135	Elektrotechnika w budownictwie	dr inż. Ł. Sołtysek	13	P2	laboratoria	aktywne
f254cfe1-a60a-4ab3-a5ab-58cacfe5b12f	EiAs6I_EIAs6A	2026-05-18	09:15:00	90	Układy automatyki przemysłowej	prof. Ł. Ścisło	A3	W	wykład	aktywne
22e8e803-2739-4dad-82e7-ef728c3bca95	EiAs6I_EIAs6A	2026-05-18	11:00:00	90	Układy automatyki przemysłowej	prof. Ł. Ścisło	11	L1	laboratoria	aktywne
912822e9-fd86-446b-966c-d75e28424eea	EiAs6I_EIAs6A	2026-05-18	12:45:00	90	Układy automatyki przemysłowej	prof. Ł. Ścisło	11	L2	laboratoria	aktywne
90c76519-6eed-4ab2-b33c-780558200ac2	EiAs6I_EIAs6A	2026-05-18	12:45:00	90	Bezpieczeństwo użytkowania urządzeń elektrycznych	dr inż. B. Rozegnał	8	L3	laboratoria	aktywne
420386f1-2735-4374-8ca6-5ede0ac73643	EiAs6I_EIAs6A	2026-05-18	14:30:00	90	Układy automatyki przemysłowej	prof. Ł. Ścisło	11	L3	laboratoria	aktywne
13f48f38-4419-48f4-a5f9-95f161597d91	EiAs6I_EIAs6A	2026-05-18	14:30:00	90	Bezpieczeństwo użytkowania urządzeń elektrycznych	dr inż. B. Rozegnał	8	L2	laboratoria	aktywne
d81d48ae-6d20-414e-a56a-49f16518ea16	EiAs6I_EIAs6A	2026-05-18	16:15:00	90	Układy automatyki przemysłowej	prof. Ł. Ścisło	11	L4	laboratoria	aktywne
d3bb2def-1962-4df7-8a23-815ae2524565	EiAs6I_EIAs6A	2026-05-18	18:00:00	90	Układy automatyki przemysłowej	prof. Ł. Ścisło	11	P1	laboratoria	aktywne
c64fdecd-af95-414d-8bd6-cb24aedcb995	EiAs6I_EIAs6A	2026-05-19	09:15:00	135	Pojazdy elektryczne	dr inż. W. Czuchra / dr inż. B. Woszczyna / dr inż. M. Dudzuk	b. 10-14	L3 / L4	laboratoria	aktywne
b478e486-5f01-403b-b739-9c72a4916f8d	EiAs6I_EIAs6A	2026-05-19	11:45:00	135	Pojazdy elektryczne	dr inż. W. Czuchra / dr inż. B. Woszczyna / dr inż. M. Dudzuk	b. 10-14	L1 / L2	laboratoria	aktywne
e495d8d2-caed-4da6-8461-6080b4a282da	EiAs6I_EIAs6A	2026-05-20	07:30:00	90	Prawo patentowe	dr inż. A. Drwal	A1	W	wykład	aktywne
449e99e4-31ab-4efc-9ed4-fbe689cf8caf	EiAs6I_EIAs6A	2026-05-20	09:30:00	135	Napędy elektryczne	prof. P. Drozdowski	A1	W	wykład	aktywne
be67ccba-ee7d-4cfa-9a4d-71281e1bbadd	EiAs6I_EIAs6A	2026-05-20	13:45:00	135	Napędy elektryczne	prof. P. Drozdowski	13	P1	laboratoria	aktywne
8dee9076-b8c2-408d-8752-70775fa6c973	EiAs6I_EIAs6A	2026-05-20	16:15:00	135	Napędy elektryczne	prof. P. Drozdowski	13	P2	laboratoria	aktywne
7d7c7858-33b3-4523-aa51-ad323fd94503	EiAs6I_EIAs6A	2026-05-21	12:30:00	135	Elektrotechnika w budownictwie	dr inż. B. Rozegnał / mgr inż. D. Mamcarz	8	L1	laboratoria	aktywne
e1632d1c-1fc1-4fd8-8a29-32cb2c9c3a9a	EiAs6I_EIAs6A	2026-05-22	08:30:00	90	Elektrotechnika w budownictwie	dr inż. Ł. Sołtysek	A4	W	wykład	aktywne
5cf1a81b-823e-4f26-8d02-f39edf5553a5	EiAs6I_EIAs6A	2026-05-24	07:00:00	900	Zielone Świątki	Brak	-	Wszystkie grupy	święto	wolne
587f78a0-0458-422b-b179-f88fa92a152f	EiAs6I_EIAs6A	2026-05-25	09:15:00	90	Układy automatyki przemysłowej	prof. Ł. Ścisło	A3	W	wykład	aktywne
5565cb7b-2dc0-4b11-b666-5011663c6f39	EiAs6I_EIAs6A	2026-05-25	11:00:00	90	Układy automatyki przemysłowej	prof. Ł. Ścisło	11	L1	laboratoria	aktywne
ef3c8d08-80a0-4c56-8f4d-c933873bd708	EiAs6I_EIAs6A	2026-05-25	12:45:00	90	Układy automatyki przemysłowej	prof. Ł. Ścisło	11	L2	laboratoria	aktywne
3253b339-577f-4796-bad5-c226f16989ea	EiAs6I_EIAs6A	2026-05-25	12:45:00	90	Bezpieczeństwo użytkowania urządzeń elektrycznych	dr inż. B. Rozegnał	8	L4	laboratoria	aktywne
bd58b598-91fd-4193-b161-9a0c5972a544	EiAs6I_EIAs6A	2026-05-25	14:30:00	90	Układy automatyki przemysłowej	prof. Ł. Ścisło	11	L3	laboratoria	aktywne
dc10dcd4-9800-41da-ab5a-87ea9af24ebc	EiAs6I_EIAs6A	2026-05-25	14:30:00	90	Bezpieczeństwo użytkowania urządzeń elektrycznych	dr inż. B. Rozegnał	8	L1	laboratoria	aktywne
071df3ac-c06d-4751-8162-a953c163964a	EiAs6I_EIAs6A	2026-05-25	16:15:00	90	Układy automatyki przemysłowej	prof. Ł. Ścisło	11	L4	laboratoria	aktywne
6b79c873-9409-4db0-86c7-ab9a8a9bdd1a	EiAs6I_EIAs6A	2026-05-25	18:00:00	90	Układy automatyki przemysłowej	prof. Ł. Ścisło	11	P2	laboratoria	aktywne
60365329-382f-405a-a1bc-dbefe8f57d75	EiAs6I_EIAs6A	2026-05-26	08:30:00	90	Napędy elektryczne	prof. P. Drozdowski / mgr inż. T. Gębarowski	013A	L2	laboratoria	aktywne
8635ddef-82e5-41d6-b680-209e8212d24e	EiAs6I_EIAs6A	2026-05-26	10:15:00	90	Napędy elektryczne	prof. P. Drozdowski	A2	Ć1	laboratoria	aktywne
0ea64f6c-9693-4a95-9cb7-c9d8e27ab3c4	EiAs6I_EIAs6A	2026-05-27	07:30:00	90	Prawo patentowe	dr inż. A. Drwal	A1	P3	laboratoria	aktywne
f1297870-07ea-4ab8-a8d5-1514a2001b5e	EiAs6I_EIAs6A	2026-05-27	09:30:00	135	Napędy elektryczne	prof. P. Drozdowski	A1	W	wykład	aktywne
a7fe3453-0ca7-45a0-98a7-02165c32ede6	EiAs6I_EIAs6A	2026-05-27	12:45:00	90	Napędy elektryczne	dr inż. A. Shymanska	A3	Ć2	laboratoria	aktywne
1d986ab8-83fa-4096-8d1b-075a3b3d7d35	EiAs6I_EIAs6A	2026-05-27	14:30:00	135	Napędy elektryczne	prof. P. Drozdowski	13	P3	laboratoria	aktywne
9a510213-7f6c-4762-912d-93b1088f4661	EiAs6I_EIAs6A	2026-05-28	09:15:00	90	Elektrotechnika w budownictwie	dr inż. B. Rozegnał / mgr inż. D. Mamcarz	8	L3	laboratoria	aktywne
dc9d37f4-a14c-412f-94b5-dd25b31f6f6a	EiAs6I_EIAs6A	2026-05-28	09:15:00	90	Napędy elektryczne	dr inż. J. Tulicki / mgr inż. T. Gębarowski	013A	L4	laboratoria	aktywne
5ca3c7cc-8213-4155-8afc-e01513351265	EiAs6I_EIAs6A	2026-05-28	11:00:00	90	Elektrotechnika w budownictwie	dr inż. B. Rozegnał / mgr inż. D. Mamcarz	8	L4	laboratoria	aktywne
82cd46df-61c6-4c8f-8f93-981b4776d58b	EiAs6I_EIAs6A	2026-05-28	11:00:00	90	Napędy elektryczne	dr inż. J. Tulicki / mgr inż. T. Gębarowski	013A	L1	laboratoria	aktywne
fd0b6aa2-88ad-45e4-8719-8a1179ee3078	EiAs6I_EIAs6A	2026-05-28	12:45:00	90	Elektrotechnika w budownictwie	dr inż. B. Rozegnał / mgr inż. D. Mamcarz	8	L2	laboratoria	aktywne
ab36d708-22b2-48b3-8809-b3d2b81d2381	EiAs6I_EIAs6A	2026-05-28	12:45:00	90	Napędy elektryczne	dr inż. M. Sierżęga / mgr inż. T. Gębarowski	013A	L3	laboratoria	aktywne
8ed82453-6edd-4a57-be51-2802915791e2	EiAs6I_EIAs6A	2026-06-01	10:00:00	45	Układy automatyki przemysłowej	prof. Ł. Ścisło	A3	W	wykład	aktywne
104d801c-f4a7-401c-a9d3-68cd70b668bf	EiAs6I_EIAs6A	2026-06-01	11:00:00	90	Układy automatyki przemysłowej	prof. Ł. Ścisło	11	L1	laboratoria	aktywne
8383f16d-55b7-4ea2-a7d6-018f5060fa65	EiAs6I_EIAs6A	2026-06-01	12:45:00	90	Układy automatyki przemysłowej	prof. Ł. Ścisło	11	L2	laboratoria	aktywne
da181090-94d5-4c7c-b43a-d489f0b8c46c	EiAs6I_EIAs6A	2026-06-01	12:45:00	90	Bezpieczeństwo użytkowania urządzeń elektrycznych	dr inż. B. Rozegnał	8	L3	laboratoria	aktywne
bc20de93-96df-46d6-8e51-b029d2488e94	EiAs6I_EIAs6A	2026-06-01	14:30:00	90	Układy automatyki przemysłowej	prof. Ł. Ścisło	11	L3	laboratoria	aktywne
bcd066bc-fed4-4807-bd6a-0a272e9b1923	EiAs6I_EIAs6A	2026-06-01	14:30:00	90	Bezpieczeństwo użytkowania urządzeń elektrycznych	dr inż. B. Rozegnał	8	L2	laboratoria	aktywne
19fa81ac-ca3a-4b88-a421-11ec1d7b5bf6	EiAs6I_EIAs6A	2026-06-01	16:15:00	90	Układy automatyki przemysłowej	prof. Ł. Ścisło	11	L4	laboratoria	aktywne
6e6f2718-df62-4ff1-b917-cc183b3207e4	EiAs6I_EIAs6A	2026-06-01	18:00:00	90	Układy automatyki przemysłowej	prof. Ł. Ścisło	11	P3	laboratoria	aktywne
fb15d94c-08ee-4b76-83b1-4def23f67961	EiAs6I_EIAs6A	2026-06-02	09:15:00	90	Pojazdy elektryczne	dr inż. W. Czuchra / dr inż. B. Woszczyna / dr inż. M. Dudzuk	b. 10-14	L3 / L4	laboratoria	aktywne
66574b03-6170-42b1-9975-28db8b7e2f21	EiAs6I_EIAs6A	2026-06-02	11:45:00	90	Pojazdy elektryczne	dr inż. W. Czuchra / dr inż. B. Woszczyna / dr inż. M. Dudzuk	b. 10-14	L1 / L2	laboratoria	aktywne
06e02bed-30b3-4340-904c-190d5f2b4430	EiAs6I_EIAs6A	2026-06-03	07:30:00	45	Prawo patentowe	dr inż. A. Drwal	A1	W	wykład	aktywne
fe59fb76-2d9f-4762-bf2a-a8a67344da40	EiAs6I_EIAs6A	2026-06-03	09:15:00	45	Prawo patentowe	dr inż. A. Drwal	A1	P1	laboratoria	aktywne
01a491f3-a946-48c5-88a6-e1ed135a1ef3	EiAs6I_EIAs6A	2026-06-03	10:00:00	45	Prawo patentowe	dr inż. A. Drwal	A1	P2	laboratoria	aktywne
6ee03ba2-7525-47d2-834a-038c5b6892f0	EiAs6I_EIAs6A	2026-06-03	11:00:00	45	Prawo patentowe	dr inż. A. Drwal	A1	P3	laboratoria	aktywne
83cec0ff-a230-4cc4-b49a-a4de9ff76004	EiAs6I_EIAs6A	2026-06-03	13:45:00	135	Napędy elektryczne	prof. P. Drozdowski	13	P1	laboratoria	aktywne
5289177d-ae84-4b9d-b1f5-61ca26177e3c	EiAs6I_EIAs6A	2026-06-03	16:15:00	135	Napędy elektryczne	prof. P. Drozdowski	13	P2	laboratoria	aktywne
323cc9a6-0617-4a87-a963-aad960150a01	EiAs6I_EIAs6A	2026-06-04	07:00:00	900	Boże Ciało	Brak	-	Wszystkie grupy	święto	wolne
f1096425-fb1d-4fe8-95a0-79ea0cd25660	EiAs6I_EIAs6A	2026-06-05	07:00:00	900	Boże Ciało	Brak	-	Wszystkie grupy	święto	wolne
46d97ad8-f660-4c79-83f3-855f0b653776	EiAs6I_EIAs6A	2026-06-08	11:00:00	90	Układy automatyki przemysłowej	prof. Ł. Ścisło	11	L1	laboratoria	aktywne
6c47d79d-e05b-4301-a315-7a67ff9e8747	EiAs6I_EIAs6A	2026-06-08	12:45:00	90	Układy automatyki przemysłowej	prof. Ł. Ścisło	11	L2	laboratoria	aktywne
86fd3954-de26-43ba-89fd-71048ee42aed	EiAs6I_EIAs6A	2026-06-08	12:45:00	45	Bezpieczeństwo użytkowania urządzeń elektrycznych	dr inż. B. Rozegnał	8	L4	laboratoria	aktywne
f7cb284b-309a-4879-8b96-f8275a72c7bd	EiAs6I_EIAs6A	2026-06-08	14:30:00	90	Układy automatyki przemysłowej	prof. Ł. Ścisło	11	L3	laboratoria	aktywne
45a93845-532f-4333-9824-0ff11254100b	EiAs6I_EIAs6A	2026-06-08	14:30:00	45	Bezpieczeństwo użytkowania urządzeń elektrycznych	dr inż. B. Rozegnał	8	L1	laboratoria	aktywne
7038b17e-b59a-414e-8128-304959355742	EiAs6I_EIAs6A	2026-06-08	16:15:00	90	Układy automatyki przemysłowej	prof. Ł. Ścisło	11	L4	laboratoria	aktywne
1aa2ea6f-435d-4f76-877b-cbb1e229cb24	EiAs6I_EIAs6A	2026-06-08	18:00:00	90	Układy automatyki przemysłowej	prof. Ł. Ścisło	11	P1	laboratoria	aktywne
635a7817-7a47-4b63-9081-83e1f554b45f	EiAs6I_EIAs6A	2026-06-09	07:45:00	135	Napędy elektryczne	prof. P. Drozdowski / mgr inż. T. Gębarowski	013A	L2	laboratoria	aktywne
842b8396-5fe9-47d4-b951-7a0c1bb8a2a2	EiAs6I_EIAs6A	2026-06-09	10:15:00	135	Napędy elektryczne	prof. P. Drozdowski	A2	Ć1	laboratoria	aktywne
1f53efa4-6a1f-471c-becc-0fe2162a59fa	EiAs6I_EIAs6A	2026-06-09	14:30:00	45	Bezpieczeństwo użytkowania urządzeń elektrycznych	prof. T. Węgiel	A2	W	wykład	aktywne
5d93b16e-5d87-4a84-9853-3a016153ba17	EiAs6I_EIAs6A	2026-06-10	07:30:00	90	Prawo patentowe	dr inż. A. Drwal	A1	P1	laboratoria	aktywne
25bfeda3-0a85-497f-854d-137e8948365f	EiAs6I_EIAs6A	2026-06-10	09:15:00	90	Prawo patentowe	dr inż. A. Drwal	A1	P2	laboratoria	aktywne
ed1d51da-5633-4da1-9885-6a34fe0e678a	EiAs6I_EIAs6A	2026-06-10	12:00:00	135	Napędy elektryczne	dr inż. A. Shymanska	A3	Ć2	laboratoria	aktywne
d1b2633c-c969-4e4a-a30d-ea4c62716a99	EiAs6I_EIAs6A	2026-06-10	14:30:00	135	Napędy elektryczne	prof. P. Drozdowski	13	P3	laboratoria	aktywne
ee0bcea0-dfef-469c-a80a-0c81770ea175	EiAs6I_EIAs6A	2026-06-11	08:30:00	135	Elektrotechnika w budownictwie	dr inż. B. Rozegnał / mgr inż. D. Mamcarz	8	L3	laboratoria	aktywne
7877bc3f-2fc9-418d-ab3c-eb03629a4b05	EiAs6I_EIAs6A	2026-06-11	08:30:00	135	Napędy elektryczne	dr inż. J. Tulicki / mgr inż. T. Gębarowski	013A	L4	laboratoria	aktywne
2e3a89d4-a3fd-4f62-9617-21a64ef43237	EiAs6I_EIAs6A	2026-06-11	11:00:00	135	Elektrotechnika w budownictwie	dr inż. B. Rozegnał / mgr inż. D. Mamcarz	8	L4	laboratoria	aktywne
e6d0167c-96c2-421b-86fd-ad42e3bed238	EiAs6I_EIAs6A	2026-06-11	11:00:00	135	Napędy elektryczne	dr inż. J. Tulicki / mgr inż. T. Gębarowski	013A	L1	laboratoria	aktywne
0766b511-8ff0-4422-aaf9-8c4ceb8c7760	EiAs6I_EIAs6A	2026-06-11	13:45:00	135	Elektrotechnika w budownictwie	dr inż. B. Rozegnał / mgr inż. D. Mamcarz	8	L2	laboratoria	aktywne
aac509bd-52fc-4cba-a371-b1dccf897543	EiAs6I_EIAs6A	2026-06-11	13:45:00	135	Napędy elektryczne	dr inż. M. Sierżęga / mgr inż. T. Gębarowski	013A	L3	laboratoria	aktywne
f8762a65-62d6-442f-8810-cc3bc2467ef4	EiAs6I_EIAs6A	2026-06-15	11:00:00	90	Układy automatyki przemysłowej	prof. Ł. Ścisło	11	L1	laboratoria	aktywne
b9713648-66db-42e9-ade6-6ddfe9c95cee	EiAs6I_EIAs6A	2026-06-15	12:45:00	90	Układy automatyki przemysłowej	prof. Ł. Ścisło	11	L2	laboratoria	aktywne
12466e91-668b-488d-a126-ffa5f6711eec	EiAs6I_EIAs6A	2026-06-15	12:45:00	90	Bezpieczeństwo użytkowania urządzeń elektrycznych	dr inż. B. Rozegnał	8	L3	laboratoria	aktywne
af9b3cc7-44c6-4cf9-a792-17827c7f86fd	EiAs6I_EIAs6A	2026-06-15	14:30:00	90	Układy automatyki przemysłowej	prof. Ł. Ścisło	11	L3	laboratoria	aktywne
10342116-0e24-4c70-89aa-9cd94a5f963e	EiAs6I_EIAs6A	2026-06-15	14:30:00	135	Bezpieczeństwo użytkowania urządzeń elektrycznych	dr inż. B. Rozegnał	8	L2	laboratoria	aktywne
86cefad9-806d-4253-868a-7c40b0ce3815	EiAs6I_EIAs6A	2026-06-15	16:15:00	90	Układy automatyki przemysłowej	prof. Ł. Ścisło	11	L4	laboratoria	aktywne
96519744-d798-4fd9-b089-93302251f64c	EiAs6I_EIAs6A	2026-06-15	18:00:00	90	Układy automatyki przemysłowej	prof. Ł. Ścisło	11	P2	laboratoria	aktywne
0684ea29-baa2-466d-87f1-b66124443dd2	Erasmus	2026-03-02	12:45:00	90	Internet of Things (IoT) in applications	dr inż. P. Król	9	Lec	laboratoria	aktywne
71682120-1c0a-4f8c-878a-7cb5cf45065c	Erasmus	2026-03-02	14:30:00	90	Internet of Things (IoT) in applications	dr inż. P. Król	201	L / P	laboratoria	aktywne
8f54d2dd-582e-43c8-9455-6e43acf02d8f	Erasmus	2026-03-02	16:15:00	135	Digital Signal Processing	prof. M. Jaraczewski	13	L / P	laboratoria	aktywne
34f485e1-bf70-4b46-8163-067a6c8272e6	Erasmus	2026-03-02	18:45:00	90	Digital Signal Processing	prof. M. Jaraczewski	13	Lec	laboratoria	aktywne
d83db322-ad07-4010-90f0-ba165f74f066	Erasmus	2026-03-03	16:15:00	90	Computer Networks	dr inż. P. Król	A3	Lec	laboratoria	aktywne
bb1fce0b-d79c-472e-8032-0e947481db8d	Erasmus	2026-03-03	18:00:00	90	Computer Networks	dr inż. P. Król	202	L / P	laboratoria	aktywne
79b6331f-125f-4a7f-8c75-abed2a5cc458	Erasmus	2026-03-03	19:45:00	90	AI in databases and data analysis	mgr inż. K. Czajkowski	202	L / P	laboratoria	aktywne
d6344493-15f5-4e3f-8842-c844b8025621	Erasmus	2026-03-04	11:45:00	90	Internet Technologies	dr inż. D. Grela	19	L / P	laboratoria	aktywne
1955429d-fee8-4734-8706-36e81c30eb11	Erasmus	2026-03-04	16:15:00	90	AI in databases and data analysis	dr inż. M. Pawlik	A3	Lec	laboratoria	aktywne
380908e7-c7c5-4b75-a8a6-bdaaac122fe7	Erasmus	2026-03-04	18:00:00	90	Collaboration with AI Chats	dr inż. M. Pawlik	A3	Lec	laboratoria	aktywne
5e515f47-7805-4bc5-b689-cc826be993d8	Erasmus	2026-03-04	19:45:00	90	Collaboration with AI Chats	dr inż. M. Pawlik	19	L / P	laboratoria	aktywne
ad566a19-8d41-4896-9a8d-13166ca9aa6b	Erasmus	2026-03-05	11:00:00	90	Internet Technologies	dr inż. D. Grela	A2	Lec	laboratoria	aktywne
4b29777e-dc07-47ec-b78c-97a35752a25c	Erasmus	2026-03-06	09:15:00	90	Introduction to Modern Artificial Intelligence and Machine Learning	dr inż. M. Dudzik	202	Lec	laboratoria	aktywne
f6d7363e-7f5c-4139-bc7e-dd5df2ef25f7	Erasmus	2026-03-06	11:00:00	90	Introduction to Modern Artificial Intelligence and Machine Learning	dr inż. M. Dudzik	202	L	laboratoria	aktywne
601f9bc0-8132-4326-b1f2-c0aa9a33e39f	Erasmus	2026-03-09	12:45:00	90	Internet of Things (IoT) in applications	dr inż. P. Król	9	Lec	laboratoria	aktywne
8b126452-0d3e-4c0d-b893-751cbb5ff5c3	Erasmus	2026-03-09	14:30:00	90	Internet of Things (IoT) in applications	dr inż. P. Król	201	L / P	laboratoria	aktywne
1360c76f-8caf-407e-9095-fc05d76e2156	Erasmus	2026-03-09	16:15:00	135	Digital Signal Processing	prof. M. Jaraczewski	13	L / P	laboratoria	aktywne
ff94f295-a0d2-4dd9-8c8b-cae5caf27350	Erasmus	2026-03-09	18:45:00	90	Digital Signal Processing	prof. M. Jaraczewski	13	Lec	laboratoria	aktywne
06df809c-061f-4084-a1eb-76e4b3462276	Erasmus	2026-03-10	11:00:00	90	Engneering Graphics and Design	prof. Ł. Ścisło	9	Lec	laboratoria	aktywne
25f408d2-fb86-4189-a77e-5dc16c50567a	Erasmus	2026-03-10	12:45:00	90	Engneering Graphics and Design	prof. Ł. Ścisło	11	Lab	laboratoria	aktywne
9277466e-579b-4539-845a-51bdb86d40bb	Erasmus	2026-03-10	14:30:00	90	Engneering Graphics and Design	prof. Ł. Ścisło	11	P	laboratoria	aktywne
297cb511-fedf-4e9c-b17c-084929ce8c83	Erasmus	2026-03-10	16:15:00	90	Computer Networks	dr inż. P. Król	A3	Lec	laboratoria	aktywne
afae24a4-f871-4ad0-b92a-b2f0253520a4	Erasmus	2026-03-10	18:00:00	90	Computer Networks	dr inż. P. Król	202	L / P	laboratoria	aktywne
8f1ab1df-c809-490f-aaa1-cd79d12e2663	Erasmus	2026-03-10	19:45:00	90	AI in databases and data analysis	mgr inż. K. Czajkowski	202	L / P	laboratoria	aktywne
81fed9b9-c355-467f-8c7d-7bfff419a2d2	Erasmus	2026-03-11	11:45:00	90	Internet Technologies	dr inż. D. Grela	19	L / P	laboratoria	aktywne
423f0fa7-bd04-4a01-9cb4-b510624ebe51	Erasmus	2026-03-11	16:15:00	90	AI in databases and data analysis	dr inż. M. Pawlik	A3	Lec	laboratoria	aktywne
ed7e1e05-1d9a-483c-84b1-3c21fb780015	Erasmus	2026-03-11	18:00:00	90	Collaboration with AI Chats	dr inż. M. Pawlik	A3	Lec	laboratoria	aktywne
238889c2-c179-403d-b4c4-b4adaf6e5eac	Erasmus	2026-03-11	19:45:00	90	Collaboration with AI Chats	dr inż. M. Pawlik	19	L / P	laboratoria	aktywne
f76f9d89-4e11-4ca8-bf8d-b9a4395e1873	Erasmus	2026-03-12	11:00:00	90	Internet Technologies	dr inż. D. Grela	A2	Lec	laboratoria	aktywne
b6c6fc6f-8104-46fc-b9e2-40a868b843c2	Erasmus	2026-03-13	09:15:00	90	Introduction to Modern Artificial Intelligence and Machine Learning	dr inż. M. Dudzik	202	P	laboratoria	aktywne
cf84a9b8-2079-4f59-9ec9-d5fce1118b7a	Erasmus	2026-03-13	11:00:00	90	Introduction to Modern Artificial Intelligence and Machine Learning	dr inż. M. Dudzik	202	L	laboratoria	aktywne
51bf9c4e-cc1f-4672-baad-e3a2209939fd	Erasmus	2026-03-16	12:45:00	90	Internet of Things (IoT) in applications	dr inż. P. Król	9	Lec	laboratoria	aktywne
386ed87f-8545-409c-a953-21ef1616e923	Erasmus	2026-03-16	14:30:00	90	Internet of Things (IoT) in applications	dr inż. P. Król	201	L / P	laboratoria	aktywne
4b128c93-dbdb-4b2f-a4bd-2ddc3a24669e	Erasmus	2026-03-16	16:15:00	135	Digital Signal Processing	prof. M. Jaraczewski	13	L / P	laboratoria	aktywne
3b455540-0287-4460-a008-a10b4d4b56cf	Erasmus	2026-03-16	18:45:00	90	Digital Signal Processing	prof. M. Jaraczewski	13	Lec	laboratoria	aktywne
4f87c6f2-2b7a-48e2-a53a-dee4730de0e1	Erasmus	2026-03-17	12:45:00	90	Engneering Graphics and Design	prof. Ł. Ścisło	11	Lab	laboratoria	aktywne
2c1726ec-b772-41cd-8e1d-7f2cbe347fb2	Erasmus	2026-03-17	16:15:00	90	Computer Networks	dr inż. P. Król	A3	Lec	laboratoria	aktywne
e7e225e0-9ab1-4e56-bae2-d532070dbbb8	Erasmus	2026-03-17	18:00:00	90	Computer Networks	dr inż. P. Król	202	L / P	laboratoria	aktywne
2f25d30c-6c43-4336-a5da-5658e4cd54a1	Erasmus	2026-03-17	19:45:00	90	AI in databases and data analysis	mgr inż. K. Czajkowski	202	L / P	laboratoria	aktywne
f10d2188-9b5b-484a-a7c0-924235fd9162	Erasmus	2026-03-18	11:45:00	90	Internet Technologies	dr inż. D. Grela	19	L / P	laboratoria	aktywne
acb0ecda-28cb-4d19-99a9-7cec2c41da63	Erasmus	2026-03-18	16:15:00	90	AI in databases and data analysis	dr inż. M. Pawlik	A3	Lec	laboratoria	aktywne
8f49fd35-c5cf-4d5d-9b10-8532e53e1d8f	Erasmus	2026-03-18	18:00:00	90	Collaboration with AI Chats	dr inż. M. Pawlik	A3	Lec	laboratoria	aktywne
9f54c8e0-efbb-4a7b-adc1-03f375b6ff3a	Erasmus	2026-03-18	19:45:00	90	Collaboration with AI Chats	dr inż. M. Pawlik	19	L / P	laboratoria	aktywne
e5c52fc1-1b2c-4d0a-8365-7aab56a371e8	Erasmus	2026-03-19	11:00:00	90	Internet Technologies	dr inż. D. Grela	A2	Lec	laboratoria	aktywne
2b27f6b3-eb0a-4a0d-ac8b-b6a7e4a65c73	Erasmus	2026-03-20	09:15:00	90	Introduction to Modern Artificial Intelligence and Machine Learning	dr inż. M. Dudzik	202	Lec	laboratoria	aktywne
be26a90d-99ff-4386-8bef-a6b197eb7044	Erasmus	2026-03-20	11:00:00	90	Introduction to Modern Artificial Intelligence and Machine Learning	dr inż. M. Dudzik	202	L	laboratoria	aktywne
0dced02d-3d4d-4cc8-946c-cbe442153e33	Erasmus	2026-03-23	12:45:00	90	Internet of Things (IoT) in applications	dr inż. P. Król	9	Lec	laboratoria	aktywne
2020b4be-5c70-4c5c-b7d4-1a0b7b23560f	Erasmus	2026-03-23	14:30:00	90	Internet of Things (IoT) in applications	dr inż. P. Król	201	L / P	laboratoria	aktywne
848efe24-d2c9-4f58-806e-68907431bd62	Erasmus	2026-03-23	16:15:00	135	Digital Signal Processing	prof. M. Jaraczewski	13	L / P	laboratoria	aktywne
9aaefc24-d1e0-43b9-ad61-fbbaa47c7a62	Erasmus	2026-03-23	18:45:00	90	Digital Signal Processing	prof. M. Jaraczewski	13	Lec	laboratoria	aktywne
47a7fa51-0537-44b4-8709-a71ebf067217	Erasmus	2026-03-24	11:00:00	90	Engneering Graphics and Design	prof. Ł. Ścisło	9	Lec	laboratoria	aktywne
eca2cbfa-8af6-4b69-af18-9e361fa9e846	Erasmus	2026-03-24	12:45:00	90	Engneering Graphics and Design	prof. Ł. Ścisło	11	Lab	laboratoria	aktywne
18715f2a-3cac-4216-9d87-dc9d92d64269	Erasmus	2026-03-24	14:30:00	90	Engneering Graphics and Design	prof. Ł. Ścisło	11	P	laboratoria	aktywne
656b9d5e-2cdb-471c-aca8-86ddc97785ef	Erasmus	2026-03-24	16:15:00	90	Computer Networks	dr inż. P. Król	A3	Lec	laboratoria	aktywne
1c5d7e5b-bda8-429f-8add-db1a7cb6fd4c	Erasmus	2026-03-24	18:00:00	90	Computer Networks	dr inż. P. Król	202	L / P	laboratoria	aktywne
2ce2f0e5-c7f0-4167-9f59-da4c348c796c	Erasmus	2026-03-24	19:45:00	90	AI in databases and data analysis	mgr inż. K. Czajkowski	202	L / P	laboratoria	aktywne
11e5e5f2-31e8-4ef3-97f3-7bafc9a17291	Erasmus	2026-03-25	11:45:00	90	Internet Technologies	dr inż. D. Grela	19	L / P	laboratoria	aktywne
c12cae1f-f495-4773-9b84-e823805de31c	Erasmus	2026-03-25	16:15:00	90	AI in databases and data analysis	dr inż. M. Pawlik	A3	Lec	laboratoria	aktywne
f7715ed1-cdbe-409f-8258-0a59134498e8	Erasmus	2026-03-25	18:00:00	90	Collaboration with AI Chats	dr inż. M. Pawlik	A3	Lec	laboratoria	aktywne
f7230393-7191-430a-860e-bde980e10119	Erasmus	2026-03-25	19:45:00	90	Collaboration with AI Chats	dr inż. M. Pawlik	19	L / P	laboratoria	aktywne
6ee36433-d6e3-4844-8191-9bd607d15766	Erasmus	2026-03-26	11:00:00	90	Internet Technologies	dr inż. D. Grela	A2	Lec	laboratoria	aktywne
664adbb4-509e-4fd5-99b9-5164180b0b2f	Erasmus	2026-03-27	09:15:00	90	Introduction to Modern Artificial Intelligence and Machine Learning	dr inż. M. Dudzik	202	P	laboratoria	aktywne
399bb311-845e-4ccb-939d-91ecf97ae6a5	Erasmus	2026-03-27	11:00:00	90	Introduction to Modern Artificial Intelligence and Machine Learning	dr inż. M. Dudzik	202	L	laboratoria	aktywne
695a0d5e-98f6-4828-9ee1-c0aa3acb48a4	Erasmus	2026-03-30	12:45:00	90	Internet of Things (IoT) in applications	dr inż. P. Król	9	Lec	laboratoria	aktywne
7a74c274-ae0f-4a85-ad70-2d14dbd30799	Erasmus	2026-03-30	14:30:00	90	Internet of Things (IoT) in applications	dr inż. P. Król	201	L / P	laboratoria	aktywne
1ec55d0f-68b6-45ce-bb2e-d93219a7132e	Erasmus	2026-03-30	16:15:00	135	Digital Signal Processing	prof. M. Jaraczewski	13	L / P	laboratoria	aktywne
991f2e10-ef58-4020-9457-31ff3fd75de6	Erasmus	2026-03-30	18:45:00	90	Digital Signal Processing	prof. M. Jaraczewski	13	Lec	laboratoria	aktywne
fcb8ae0c-11c1-4a4b-a579-a78817284859	Erasmus	2026-03-31	12:45:00	90	Engneering Graphics and Design	prof. Ł. Ścisło	11	Lab	laboratoria	aktywne
f0ba3e0f-df37-452b-af56-d1d9b3e14ae9	Erasmus	2026-03-31	16:15:00	90	Computer Networks	dr inż. P. Król	A3	Lec	laboratoria	aktywne
74de7ca4-a633-44ce-8bec-79020a22ac8b	Erasmus	2026-03-31	18:00:00	90	Computer Networks	dr inż. P. Król	202	L / P	laboratoria	aktywne
b579ddc3-dce5-45c9-8a2f-1ed5ea681191	Erasmus	2026-03-31	19:45:00	90	AI in databases and data analysis	mgr inż. K. Czajkowski	202	L / P	laboratoria	aktywne
c3648403-5736-463f-9aee-2a1a3ab36a3a	Erasmus	2026-04-02	07:00:00	900	Przerwa świąteczna	Brak	-	Wszystkie grupy	święto	wolne
a6d84da5-989c-437c-804c-23d86a6e634a	Erasmus	2026-04-03	07:00:00	900	Przerwa świąteczna	Brak	-	Wszystkie grupy	święto	wolne
24e1f542-cd5d-4488-9c0a-463562dfe479	Erasmus	2026-04-04	07:00:00	900	Przerwa świąteczna	Brak	-	Wszystkie grupy	święto	wolne
86db8218-0129-42c1-b4c4-b102a28a852c	Erasmus	2026-04-05	07:00:00	900	Przerwa świąteczna	Brak	-	Wszystkie grupy	święto	wolne
fe736c87-742b-4494-8380-533c6f9f0f64	Erasmus	2026-04-06	07:00:00	900	Przerwa świąteczna	Brak	-	Wszystkie grupy	święto	wolne
96b1484e-56d0-4d1f-877b-85812299f947	Erasmus	2026-04-07	07:00:00	900	Przerwa świąteczna	Brak	-	Wszystkie grupy	święto	wolne
92782d4f-e05e-4042-a7ea-3681fb23390c	Erasmus	2026-04-08	11:45:00	90	Internet Technologies	dr inż. D. Grela	19	L / P	laboratoria	aktywne
f0ff2f66-1c74-4429-8a56-cd107ced79cb	Erasmus	2026-04-08	16:15:00	90	AI in databases and data analysis	dr inż. M. Pawlik	A3	Lec	laboratoria	aktywne
cdf8d015-960a-47be-a522-e0a367d92c98	Erasmus	2026-04-08	18:00:00	90	Collaboration with AI Chats	dr inż. M. Pawlik	A3	Lec	laboratoria	aktywne
48ac6bc9-0b95-45f8-9fca-0eceb191767b	Erasmus	2026-04-08	19:45:00	90	Collaboration with AI Chats	dr inż. M. Pawlik	19	L / P	laboratoria	aktywne
1852e680-a782-4bb9-9afc-8ab1de6e97ae	Erasmus	2026-04-09	11:00:00	90	Internet Technologies	dr inż. D. Grela	A2	Lec	laboratoria	aktywne
2725e905-0e71-4189-82f7-99c53f02af08	Erasmus	2026-04-10	09:15:00	90	Introduction to Modern Artificial Intelligence and Machine Learning	dr inż. M. Dudzik	202	P	laboratoria	aktywne
28b3360f-53e8-4227-b960-409f00bd9974	Erasmus	2026-04-10	11:00:00	90	Introduction to Modern Artificial Intelligence and Machine Learning	dr inż. M. Dudzik	202	L	laboratoria	aktywne
d9a48bad-1e8a-4051-9d6f-320b2cd4119e	Erasmus	2026-04-13	12:45:00	90	Internet of Things (IoT) in applications	dr inż. P. Król	9	Lec	laboratoria	aktywne
c51589c9-e161-4d3e-b061-6d00be762f43	Erasmus	2026-04-13	14:30:00	90	Internet of Things (IoT) in applications	dr inż. P. Król	201	L / P	laboratoria	aktywne
7f84d26a-2157-49ba-81c0-9e69ff7187ab	Erasmus	2026-04-13	16:15:00	135	Digital Signal Processing	prof. M. Jaraczewski	13	L / P	laboratoria	aktywne
41d46ade-ddee-4235-86b1-d35d715f619f	Erasmus	2026-04-14	12:45:00	90	Engneering Graphics and Design	prof. Ł. Ścisło	11	Lab	laboratoria	aktywne
74d63940-368f-486a-98ff-6b5b8028dd9a	Erasmus	2026-04-14	16:15:00	90	Computer Networks	dr inż. P. Król	A3	Lec	laboratoria	aktywne
1a386c22-3f3a-4669-abec-f269f2503fd2	Erasmus	2026-04-14	18:00:00	90	Computer Networks	dr inż. P. Król	202	L / P	laboratoria	aktywne
b5b240e5-2e8c-4882-b24b-ca27047c11da	Erasmus	2026-04-14	19:45:00	90	AI in databases and data analysis	mgr inż. K. Czajkowski	202	L / P	laboratoria	aktywne
e0564bef-7bb9-4dc1-afd0-a0b715809c92	Erasmus	2026-04-15	11:45:00	90	Internet Technologies	dr inż. D. Grela	19	L / P	laboratoria	aktywne
ec9e5682-2d05-4148-b6cf-a001c5474c83	Erasmus	2026-04-15	16:15:00	90	AI in databases and data analysis	dr inż. M. Pawlik	A3	Lec	laboratoria	aktywne
b03f9911-c234-41ba-883f-62ef56bb4782	Erasmus	2026-04-15	18:00:00	90	Collaboration with AI Chats	dr inż. M. Pawlik	A3	Lec	laboratoria	aktywne
4e3ca47b-183b-4496-9d57-2b2b7297c7d6	Erasmus	2026-04-15	19:45:00	90	Collaboration with AI Chats	dr inż. M. Pawlik	19	L / P	laboratoria	aktywne
54f590ac-9733-406b-ae7b-c2c40a81c1f3	Erasmus	2026-04-16	11:00:00	90	Internet Technologies	dr inż. D. Grela	A2	Lec	laboratoria	aktywne
63105df8-18e9-4f20-b69d-c9ce2b961b72	Erasmus	2026-04-17	09:15:00	90	Introduction to Modern Artificial Intelligence and Machine Learning	dr inż. M. Dudzik	202	Lec	laboratoria	aktywne
d21da8db-2135-4529-b0e5-475acf90f286	Erasmus	2026-04-17	11:00:00	90	Introduction to Modern Artificial Intelligence and Machine Learning	dr inż. M. Dudzik	202	L	laboratoria	aktywne
97812b72-d4bb-4c5d-b25e-49f52192d811	Erasmus	2026-04-20	12:45:00	90	Internet of Things (IoT) in applications	dr inż. P. Król	9	Lec	laboratoria	aktywne
0f5f69a1-eb0b-4ce7-971b-833bd660f94d	Erasmus	2026-04-20	14:30:00	90	Internet of Things (IoT) in applications	dr inż. P. Król	201	L / P	laboratoria	aktywne
161cb86c-a210-457b-b5b9-2756b28b50da	Erasmus	2026-04-20	16:15:00	135	Digital Signal Processing	prof. M. Jaraczewski	13	L / P	laboratoria	aktywne
0b90e984-7840-48bf-a679-c7096deaed99	Erasmus	2026-04-21	11:00:00	90	Engneering Graphics and Design	prof. Ł. Ścisło	9	Lec	laboratoria	aktywne
4f9dce4d-02f8-49f3-bdb5-504ff58ee96e	Erasmus	2026-04-21	12:45:00	90	Engneering Graphics and Design	prof. Ł. Ścisło	11	Lab	laboratoria	aktywne
58596fd5-7569-4fc1-96dc-318a20bf6546	Erasmus	2026-04-21	14:30:00	90	Engneering Graphics and Design	prof. Ł. Ścisło	11	P	laboratoria	aktywne
f20d09fa-802e-45d1-9da6-4b0596280c57	Erasmus	2026-04-21	16:15:00	90	Computer Networks	dr inż. P. Król	A3	Lec	laboratoria	aktywne
3d3a9212-8c81-4ddd-9f35-b8d6f8d5d0bd	Erasmus	2026-04-21	18:00:00	90	Computer Networks	dr inż. P. Król	202	L / P	laboratoria	aktywne
ed7b89bb-18c0-4b6b-abac-2ecca9bad6cd	Erasmus	2026-04-21	19:45:00	90	AI in databases and data analysis	mgr inż. K. Czajkowski	202	L / P	laboratoria	aktywne
e28a0b41-6469-42c8-acda-e69f23b4814d	Erasmus	2026-04-22	11:45:00	90	Internet Technologies	dr inż. D. Grela	19	L / P	laboratoria	aktywne
c5f8be33-6b84-48da-a74d-c0637ba4f72e	Erasmus	2026-04-22	16:15:00	90	AI in databases and data analysis	dr inż. M. Pawlik	A3	Lec	laboratoria	aktywne
fce549a8-7721-4b93-9246-35054683f58c	Erasmus	2026-04-22	18:00:00	90	Collaboration with AI Chats	dr inż. M. Pawlik	A3	Lec	laboratoria	aktywne
3af0e149-e415-4433-9032-bf346006bd04	Erasmus	2026-04-22	19:45:00	90	Collaboration with AI Chats	dr inż. M. Pawlik	19	L / P	laboratoria	aktywne
5f00b597-2cd2-4d30-aa24-442dfabf8ee7	Erasmus	2026-04-23	11:00:00	90	Internet Technologies	dr inż. D. Grela	A2	Lec	laboratoria	aktywne
019411ca-dcfc-47df-ba76-045934dd2094	Erasmus	2026-04-24	09:15:00	90	Introduction to Modern Artificial Intelligence and Machine Learning	dr inż. M. Dudzik	202	P	laboratoria	aktywne
db9f0a33-fec9-4ebc-b85e-d9db6c81e35d	Erasmus	2026-04-24	11:00:00	90	Introduction to Modern Artificial Intelligence and Machine Learning	dr inż. M. Dudzik	202	L	laboratoria	aktywne
92d63a58-9566-43bd-8dfb-cb43c2fcbdf1	Erasmus	2026-04-27	12:45:00	90	Internet of Things (IoT) in applications	dr inż. P. Król	9	Lec	laboratoria	aktywne
bacbe8a5-98c9-4a5b-8fc8-2b1186116268	Erasmus	2026-04-27	14:30:00	90	Internet of Things (IoT) in applications	dr inż. P. Król	201	L / P	laboratoria	aktywne
9825c072-feb0-459a-8807-b3b9b86d57c6	Erasmus	2026-04-27	16:15:00	135	Digital Signal Processing	prof. M. Jaraczewski	13	L / P	laboratoria	aktywne
9a89d816-3578-4531-964c-8ed94ae8850a	Erasmus	2026-04-28	12:45:00	90	Engneering Graphics and Design	prof. Ł. Ścisło	11	Lab	laboratoria	aktywne
ce60092b-d3ab-4e5f-9538-27ef20c8c587	Erasmus	2026-04-28	16:15:00	90	Computer Networks	dr inż. P. Król	A3	Lec	laboratoria	aktywne
5b088a7b-a1d6-4f18-bb53-6c8a6eff02a4	Erasmus	2026-04-28	18:00:00	90	Computer Networks	dr inż. P. Król	202	L / P	laboratoria	aktywne
531ef25d-cf89-499a-a25f-9a64fc0b5c91	Erasmus	2026-04-28	19:45:00	90	AI in databases and data analysis	mgr inż. K. Czajkowski	202	L / P	laboratoria	aktywne
83299c95-bf91-4968-acfb-d5e9694a7d37	Erasmus	2026-04-29	11:45:00	90	Internet Technologies	dr inż. D. Grela	19	L / P	laboratoria	aktywne
d232b289-af8b-45a4-be57-ec4d0bd8e684	Erasmus	2026-04-29	16:15:00	90	AI in databases and data analysis	dr inż. M. Pawlik	A3	Lec	laboratoria	aktywne
5caf1617-cad7-4fbc-b2fe-ea666896a472	Erasmus	2026-04-29	18:00:00	90	Collaboration with AI Chats	dr inż. M. Pawlik	A3	Lec	laboratoria	aktywne
4d397c44-1e62-401e-889a-6012da638722	Erasmus	2026-04-29	19:45:00	90	Collaboration with AI Chats	dr inż. M. Pawlik	19	L / P	laboratoria	aktywne
cf816446-0e1d-4fad-a8dd-17345eca1eb6	Erasmus	2026-04-30	11:00:00	90	Internet Technologies	dr inż. D. Grela	A2	Lec	laboratoria	aktywne
fa4720e2-5fa0-42a4-a7e6-2f50dab0caef	Erasmus	2026-05-01	07:00:00	900	Majówka	Brak	-	Wszystkie grupy	święto	wolne
c16c3dca-d51e-4890-a49c-f0908a762b5b	Erasmus	2026-05-02	07:00:00	900	Majówka	Brak	-	Wszystkie grupy	święto	wolne
c554b66a-0ce6-444a-a157-a32cffc59d53	Erasmus	2026-05-03	07:00:00	900	Majówka	Brak	-	Wszystkie grupy	święto	wolne
d91e9eb3-fef8-422f-9cb7-a92163a43c60	Erasmus	2026-05-04	07:00:00	900	Majówka	Brak	-	Wszystkie grupy	święto	wolne
cff93298-8cc1-4cce-97b9-762eddcd69da	Erasmus	2026-05-05	11:00:00	90	Engneering Graphics and Design	prof. Ł. Ścisło	9	Lec	laboratoria	aktywne
3a9526cd-8a19-4f4b-a373-f92a531c2cd5	Erasmus	2026-05-05	12:45:00	90	Engneering Graphics and Design	prof. Ł. Ścisło	11	Lab	laboratoria	aktywne
42ffb71d-5763-497a-b2ec-4bb67f6ecf6d	Erasmus	2026-05-05	14:30:00	90	Engneering Graphics and Design	prof. Ł. Ścisło	11	P	laboratoria	aktywne
f0400e9e-1144-4253-b7b6-a45e4d3e75c3	Erasmus	2026-05-05	16:15:00	90	Computer Networks	dr inż. P. Król	A3	Lec	laboratoria	aktywne
6ceb5a27-c644-4215-b184-8a23780d23d6	Erasmus	2026-05-05	18:00:00	90	Computer Networks	dr inż. P. Król	202	L / P	laboratoria	aktywne
9a9841c8-93b5-4e53-be68-41bbb708bf51	Erasmus	2026-05-05	19:45:00	90	AI in databases and data analysis	mgr inż. K. Czajkowski	202	L / P	laboratoria	aktywne
62283a36-37fc-407b-b7a5-e0618ecd999e	Erasmus	2026-05-06	11:45:00	90	Internet Technologies	dr inż. D. Grela	19	L / P	laboratoria	aktywne
d427c427-5f39-4995-97ad-5dbf0b06616a	Erasmus	2026-05-06	16:15:00	90	AI in databases and data analysis	dr inż. M. Pawlik	A3	Lec	laboratoria	aktywne
fde29ecf-73c7-4501-8065-9dca90f980da	Erasmus	2026-05-06	18:00:00	90	Collaboration with AI Chats	dr inż. M. Pawlik	A3	Lec	laboratoria	aktywne
f45566b9-5e1e-495d-a7be-b2ae70f25800	Erasmus	2026-05-06	19:45:00	90	Collaboration with AI Chats	dr inż. M. Pawlik	19	L / P	laboratoria	aktywne
210a82b2-77e9-40db-a7ce-acab506d2622	Erasmus	2026-05-07	11:00:00	90	Internet Technologies	dr inż. D. Grela	A2	Lec	laboratoria	aktywne
641ac514-0106-4eb7-8fed-35f7c022054c	Erasmus	2026-05-08	09:15:00	90	Introduction to Modern Artificial Intelligence and Machine Learning	dr inż. M. Dudzik	202	P	laboratoria	aktywne
9d051ac1-685c-4964-8251-49ffcc91a2b1	Erasmus	2026-05-08	11:00:00	90	Introduction to Modern Artificial Intelligence and Machine Learning	dr inż. M. Dudzik	202	L	laboratoria	aktywne
c2edc474-383b-4aa2-9699-2649ae197d89	Erasmus	2026-05-11	12:45:00	90	Internet of Things (IoT) in applications	dr inż. P. Król	9	Lec	laboratoria	aktywne
f99e10ad-9cc9-43af-8c1e-632acf5d8075	Erasmus	2026-05-11	14:30:00	90	Internet of Things (IoT) in applications	dr inż. P. Król	201	L / P	laboratoria	aktywne
ea396b7e-a7ae-4e20-ae51-493011d8784b	Erasmus	2026-05-11	16:15:00	135	Digital Signal Processing	prof. M. Jaraczewski	13	L / P	laboratoria	aktywne
ef3bfb61-f850-489b-9dad-f10f359c0efd	Erasmus	2026-05-12	07:00:00	900	Święto Szkoły	Brak	-	Wszystkie grupy	święto	wolne
fc83e929-341f-42bb-9b99-eec0d603be3b	Erasmus	2026-05-13	11:45:00	90	Internet Technologies	dr inż. D. Grela	19	L / P	laboratoria	aktywne
992889a6-624b-4d21-a27e-48ea22db4a92	Erasmus	2026-05-13	16:15:00	90	AI in databases and data analysis	dr inż. M. Pawlik	A3	Lec	laboratoria	aktywne
b918ab0f-cfd2-44e1-b175-16006c3afeca	Erasmus	2026-05-13	18:00:00	90	Collaboration with AI Chats	dr inż. M. Pawlik	A3	Lec	laboratoria	aktywne
e02d69ba-d3eb-4e1c-98be-d84694550a53	Erasmus	2026-05-13	19:45:00	90	Collaboration with AI Chats	dr inż. M. Pawlik	19	L / P	laboratoria	aktywne
1d74fe17-add0-48b1-bea9-30ad54d1268c	Erasmus	2026-05-14	11:00:00	90	Internet Technologies	dr inż. D. Grela	A2	Lec	laboratoria	aktywne
4e0297f8-3bbd-4002-8ebf-bb6cd560e89d	Erasmus	2026-05-15	09:15:00	90	Introduction to Modern Artificial Intelligence and Machine Learning	dr inż. M. Dudzik	202	Lec	laboratoria	aktywne
cdbe8e7a-5609-4834-9152-ee67b6c8b63e	Erasmus	2026-05-15	11:00:00	90	Introduction to Modern Artificial Intelligence and Machine Learning	dr inż. M. Dudzik	202	L	laboratoria	aktywne
3f6f74e2-598b-47e4-a2de-5bab01ab420b	Erasmus	2026-05-18	12:45:00	90	Internet of Things (IoT) in applications	dr inż. P. Król	9	Lec	laboratoria	aktywne
1040aef8-16d4-4366-ba09-81f0fbbc235d	Erasmus	2026-05-18	14:30:00	90	Internet of Things (IoT) in applications	dr inż. P. Król	201	L / P	laboratoria	aktywne
c2de5f87-7dbd-46d7-ae3f-379b520974bc	Erasmus	2026-05-18	16:15:00	135	Digital Signal Processing	prof. M. Jaraczewski	13	L / P	laboratoria	aktywne
0b50b037-15e7-4cbc-b44e-4f3257e261b8	Erasmus	2026-05-19	11:00:00	90	Engneering Graphics and Design	prof. Ł. Ścisło	9	Lec	laboratoria	aktywne
e18966a7-6420-414e-ac31-97b5eba2e549	Erasmus	2026-05-19	12:45:00	90	Engneering Graphics and Design	prof. Ł. Ścisło	11	Lab	laboratoria	aktywne
35d68d68-8891-43d6-b2b8-9b8ccfa5abfd	Erasmus	2026-05-19	14:30:00	90	Engneering Graphics and Design	prof. Ł. Ścisło	11	P	laboratoria	aktywne
aa95ec6e-4227-4938-8a9f-891acbe00986	Erasmus	2026-05-19	16:15:00	90	Computer Networks	dr inż. P. Król	A3	Lec	laboratoria	aktywne
b3172417-ad28-4a31-945d-07fe01add3af	Erasmus	2026-05-19	18:00:00	90	Computer Networks	dr inż. P. Król	202	L / P	laboratoria	aktywne
8e3bea9b-6b48-4a05-96ac-e10dd76921c5	Erasmus	2026-05-19	19:45:00	90	AI in databases and data analysis	mgr inż. K. Czajkowski	202	L / P	laboratoria	aktywne
ab420aa6-1850-4a5c-b193-840396738260	Erasmus	2026-05-20	11:45:00	90	Internet Technologies	dr inż. D. Grela	19	L / P	laboratoria	aktywne
adad05e9-951c-42ac-97a9-e0e0321d95bc	Erasmus	2026-05-20	19:45:00	90	Collaboration with AI Chats	dr inż. M. Pawlik	19	L / P	laboratoria	aktywne
109cb3fc-e828-4330-b61e-5cab94aba7f1	Erasmus	2026-05-22	09:15:00	180	Introduction to Modern Artificial Intelligence and Machine Learning	dr inż. M. Dudzik	202	L	laboratoria	aktywne
29be5bb8-12df-4408-a5f7-adc8eb969acf	Erasmus	2026-05-24	07:00:00	900	Zielone Świątki	Brak	-	Wszystkie grupy	święto	wolne
e62b9ea4-1a8a-40f7-9906-a53759b8b4fb	Erasmus	2026-05-25	14:30:00	90	Internet of Things (IoT) in applications	dr inż. P. Król	201	L / P	laboratoria	aktywne
18f20c5a-7edc-4c1f-8e1f-7d03cb8b595d	Erasmus	2026-05-25	16:15:00	135	Digital Signal Processing	prof. M. Jaraczewski	13	L / P	laboratoria	aktywne
820945d1-39d3-465d-bc5f-32bd38c50800	Erasmus	2026-05-26	12:45:00	90	Engneering Graphics and Design	prof. Ł. Ścisło	11	Lab	laboratoria	aktywne
0ecd9ae1-aad8-4833-b0d3-e581a688abe3	Erasmus	2026-05-26	18:00:00	90	Computer Networks	dr inż. P. Król	202	L / P	laboratoria	aktywne
974c7e20-2ea3-45ae-974d-fa7c89355175	Erasmus	2026-05-26	19:45:00	90	AI in databases and data analysis	mgr inż. K. Czajkowski	202	L / P	laboratoria	aktywne
f5558a48-df4a-4828-a2b2-9e3e27ae06ed	Erasmus	2026-05-27	11:45:00	90	Internet Technologies	dr inż. D. Grela	19	L / P	laboratoria	aktywne
59650c6b-0c4e-4bad-81b5-a39b056e094b	Erasmus	2026-05-27	19:45:00	90	Collaboration with AI Chats	dr inż. M. Pawlik	19	L / P	laboratoria	aktywne
58d32a05-4bbd-4c37-a90f-c50e5c6f898e	Erasmus	2026-05-29	09:15:00	90	Introduction to Modern Artificial Intelligence and Machine Learning	dr inż. M. Dudzik	202	Lec	laboratoria	aktywne
5123dab1-4177-457d-80ce-f4a56d326487	Erasmus	2026-05-29	11:00:00	135	Introduction to Modern Artificial Intelligence and Machine Learning	dr inż. M. Dudzik	202	L	laboratoria	aktywne
97624a18-3f48-4bff-a027-d8ee78cc9f16	Erasmus	2026-06-01	14:30:00	90	Internet of Things (IoT) in applications	dr inż. P. Król	201	L / P	laboratoria	aktywne
d4a1decd-e9e9-40a5-8912-5acead0ae8b9	Erasmus	2026-06-01	16:15:00	90	Digital Signal Processing	prof. M. Jaraczewski	13	L / P	laboratoria	aktywne
19c630ff-f8e3-4845-bb40-0f208acbda36	Erasmus	2026-06-02	12:45:00	90	Engneering Graphics and Design	prof. Ł. Ścisło	11	Lab	laboratoria	aktywne
ae8706ed-df52-4026-8def-609835027597	Erasmus	2026-06-02	18:00:00	90	Computer Networks	dr inż. P. Król	202	L / P	laboratoria	aktywne
7e698dcc-428f-434c-8aa8-4b8f7cbc4f7a	Erasmus	2026-06-02	19:45:00	90	AI in databases and data analysis	mgr inż. K. Czajkowski	202	L / P	laboratoria	aktywne
4051332c-19cf-470b-9b8d-3ead40dc3de7	Erasmus	2026-06-03	11:45:00	45	Internet Technologies	dr inż. D. Grela	19	L / P	laboratoria	aktywne
48b1a1fd-2677-493b-ba11-922c1ee296e7	Erasmus	2026-06-03	19:45:00	45	Collaboration with AI Chats	dr inż. M. Pawlik	19	L / P	laboratoria	aktywne
c063bb68-2f42-4eb5-a967-9757c2d6e338	Erasmus	2026-06-04	07:00:00	900	Boże Ciało	Brak	-	Wszystkie grupy	święto	wolne
59c80ee8-c9d2-4640-abf1-93eaf1e1a6d2	Erasmus	2026-06-05	07:00:00	900	Boże Ciało	Brak	-	Wszystkie grupy	święto	wolne
4146938e-b401-4b58-a8c4-2a649f71fddf	Erasmus	2026-06-08	14:30:00	45	Internet of Things (IoT) in applications	dr inż. P. Król	201	L / P	laboratoria	aktywne
715980c4-1fa8-4b92-9876-93008822e12d	Erasmus	2026-06-09	12:45:00	90	Engneering Graphics and Design	prof. Ł. Ścisło	11	Lab	laboratoria	aktywne
afd69cf3-4914-499d-8f5e-d9759b9b013c	Erasmus	2026-06-09	18:00:00	45	Computer Networks	dr inż. P. Król	202	L / P	laboratoria	aktywne
8606cfa8-a2ce-4fd8-8e0c-881906d2f56f	Erasmus	2026-06-09	19:45:00	45	AI in databases and data analysis	mgr inż. K. Czajkowski	202	L / P	laboratoria	aktywne
6c39c72a-098a-4b97-b48d-61ff5c48013e	Erasmus	2026-06-16	12:45:00	45	Engneering Graphics and Design	prof. Ł. Ścisło	11	Lab	laboratoria	aktywne
4a367483-4787-47ac-8cd2-0c8bb8357e17	Its1	2026-02-23	09:15:00	90	Technologie IoT	dr inż. P. Król	201	W	wykład	aktywne
263bda12-ebf0-4d11-bbba-9a85e8b2bfe3	Its1	2026-02-23	11:00:00	90	Technologie IoT	dr inż. P. Król	201	Lk1	laboratoria	aktywne
27b3bb6d-b893-4851-8c18-e06dfa3ac219	Its1	2026-02-23	12:45:00	90	Inżynieria materiałowa w Infotronice	dr inż. S. Bartel / mgr inż. K. Sołtys	10	W	wykład	aktywne
fde4f7b3-1d8d-4986-9ab5-23c7ebc61213	Its1	2026-02-23	14:30:00	180	LabVIEW w sterowaniu systemów mechatronicznych	mgr inż. K. Sołtys	12	Lk1	laboratoria	aktywne
298720c3-fde9-4864-b8b7-25f7b4bbb7e1	Its1	2026-02-24	09:15:00	90	Język niemiecki	mgr E. Targosz	150SJO	Lek	laboratoria	aktywne
f5197b26-2ffe-4d1a-8a55-558496bddad4	Its1	2026-02-24	09:15:00	90	Język angielski	mgr E. Szabat	9	Lek1	laboratoria	aktywne
fce339bd-32ae-4757-8de9-559a15d9285c	Its1	2026-02-24	12:45:00	90	LabVIEW w sterowaniu systemów mechatronicznych	dr inż. T. Makowski / mgr inż. J. Zielonka	WA2	L1	laboratoria	aktywne
141a9aa1-3b31-4e06-91f7-264e047f6529	Its1	2026-02-24	14:30:00	90	Sensory w układach automatyki i robotyki	prof. K. Tomczyk / dr inż. M. Sieja	208B	L1	laboratoria	aktywne
9afe6a6c-0bc0-4687-a76e-6fbe75345ba9	Its1	2026-02-24	16:15:00	90	Sensory w układach automatyki i robotyki	prof. K. Tomczyk	A1	W	wykład	aktywne
706eea44-e812-49bd-82d1-0af818e7d388	Its1	2026-02-25	10:00:00	135	Sterowanie i programowanie robotów stacjonarnych	dr inż. M. Sieja	11	L1	laboratoria	aktywne
ed2a46fb-970c-451c-b5a7-b240b6ba816d	Its1	2026-02-25	12:30:00	90	Metody komputerowe w analizie i syntezie układów mechatronicznych	mgr inż. P. Tofilski	13	Lk1	laboratoria	aktywne
7fc1fc07-252a-4ece-adc0-4632c46e209d	Its1	2026-02-26	09:15:00	90	Zintegrowane systemy sterowania w budownictwie	dr inż. A. Romańska	A2	W	wykład	aktywne
b7f18ca1-f0ee-438e-b896-e320c4e70508	Its1	2026-02-26	11:00:00	90	Zintegrowane systemy sterowania w budownictwie	dr inż. A. Romańska	WA201	L1	laboratoria	aktywne
0f7b7f4a-24ee-4593-ac47-feb8eb3a340b	Its1	2026-02-26	12:45:00	135	Historyczne i filozoficzne aspekty techniki	prof. K. Kluszczyński	9	W	wykład	aktywne
c08d2268-ec7b-4441-b604-c2d7b7679f7a	Its1	2026-02-26	16:45:00	90	Jednostki sterujące systemów mechatronicznych i ich programowanie	dr inż. K. Suchenia	A3	W	wykład	aktywne
7b417a31-a3d1-417c-9ca1-c38d71be2c8e	Its1	2026-02-26	18:30:00	90	Jednostki sterujące systemów mechatronicznych i ich programowanie	dr inż. K. Suchenia	208E	L1	laboratoria	aktywne
5b15b301-dc79-432c-bfa6-3e2ba79912da	Its1	2026-02-27	07:30:00	90	Wbudowane systemy sterowania	dr inż. D. Dorota	A3	W	wykład	aktywne
6c4bdea9-4d09-427b-bada-acc34837ca77	Its1	2026-02-27	09:15:00	90	Wbudowane systemy sterowania	dr inż. D. Dorota	208G	L1	laboratoria	aktywne
07caff84-76b7-40a9-910e-3fcb6023b895	Its1	2026-02-27	14:15:00	90	Wybrane metody obliczeniowe inżynierii	prof. V. Samotyy	10	W	wykład	aktywne
53db41b2-a9de-43c7-bbb5-c6ef849d6d6e	Its1	2026-03-02	11:00:00	90	Technologie IoT	dr inż. P. Król	201	Lk1	laboratoria	aktywne
ff8bb786-7902-4474-838f-1d26742ccc12	Its1	2026-03-02	12:45:00	90	Inżynieria materiałowa w Infotronice	dr inż. S. Bartel / mgr inż. K. Sołtys	10	W	wykład	aktywne
59dfa005-4f0d-475f-a67b-1dab9ff31077	Its1	2026-03-03	09:15:00	90	Język niemiecki	mgr E. Targosz	150SJO	Lek	laboratoria	aktywne
56791336-0497-4992-be21-77f237050305	Its1	2026-03-03	09:15:00	90	Język angielski	mgr E. Szabat	9	Lek1	laboratoria	aktywne
c6fad08c-454f-4a32-8a87-490cf8ed8140	Its1	2026-03-03	12:45:00	90	LabVIEW w sterowaniu systemów mechatronicznych	dr inż. T. Makowski / mgr inż. J. Zielonka	WA2	L1	laboratoria	aktywne
84e057b1-6da6-4487-9740-1499f25283b9	Its1	2026-03-03	14:30:00	90	Sensory w układach automatyki i robotyki	prof. K. Tomczyk	208B	P1	laboratoria	aktywne
6b90f54e-7bfc-4062-9d66-6a0ec9a6b5dd	Its1	2026-03-03	16:15:00	90	Sterowanie i programowanie robotów stacjonarnych	dr inż. M. Sieja	A1	W	wykład	aktywne
49591261-efa1-46ec-a015-b2ed0354f840	Its1	2026-03-04	10:00:00	135	Sterowanie i programowanie robotów stacjonarnych	dr inż. M. Sieja	11	L1	laboratoria	aktywne
55b1eb71-b20d-4241-a78e-f79a6f7d803b	Its1	2026-03-04	12:30:00	90	Metody komputerowe w analizie i syntezie układów mechatronicznych	mgr inż. P. Tofilski	13	Lk1	laboratoria	aktywne
eca16d49-0c81-490c-8fb8-7c9b990637f4	Its1	2026-03-05	12:45:00	135	Historyczne i filozoficzne aspekty techniki	prof. K. Kluszczyński	9	W	wykład	aktywne
a493cf76-479f-4210-8e13-d12981c7d116	Its1	2026-03-05	16:45:00	90	Metody komputerowe w analizie i syntezie układów mechatronicznych	dr inż. S. Bartel / mgr inż. P. Tofilski	10	W	wykład	aktywne
e8e799de-be8e-4ee2-8aba-13dd7b8cba95	Its1	2026-03-05	18:30:00	90	Jednostki sterujące systemów mechatronicznych i ich programowanie	dr inż. K. Suchenia	208E	L1	laboratoria	aktywne
1753b67d-df05-4693-b07a-b38e6891f248	Its1	2026-03-06	09:15:00	90	Skanowanie, obrazowanie i szybkie prototypowanie elemntów mechatroniki	dr inż. Z. Pilch / mgr inż. M. Gibas	WA203	L1	laboratoria	aktywne
1f4a5c20-2903-42fd-b0e3-103851f954aa	Its1	2026-03-06	11:00:00	90	Skanowanie, obrazowanie i szybkie prototypowanie elemntów mechatroniki	dr inż. Z. Pilch / mgr inż. M. Gibas	WA203	Lk1	laboratoria	aktywne
367f78c2-d545-4425-9352-2b91c1911546	Its1	2026-03-06	12:45:00	90	Skanowanie, obrazowanie i szybkie prototypowanie elemntów mechatroniki	dr inż. Z. Pilch	9	W	wykład	aktywne
e397cabe-7918-4255-b1fa-84fad7b7b7bf	Its1	2026-03-09	09:15:00	90	Technologie IoT	dr inż. P. Król	201	W	wykład	aktywne
0274b318-44b3-415a-a630-a894c2b88c76	Its1	2026-03-09	11:00:00	90	Technologie IoT	dr inż. P. Król	201	Lk1	laboratoria	aktywne
a6765b03-7bb3-4f2f-8066-49b3fb4c9d9e	Its1	2026-04-21	16:15:00	90	Sensory w układach automatyki i robotyki	prof. K. Tomczyk	A1	W	wykład	aktywne
8b445f92-bf8f-4e37-a90f-add0416d09c5	Its1	2026-03-09	12:45:00	90	Inżynieria materiałowa w Infotronice	dr inż. S. Bartel / mgr inż. K. Sołtys	10	W	wykład	aktywne
31ec0823-3652-4fbe-be94-ad53f1fa85dc	Its1	2026-03-09	14:30:00	225	LabVIEW w sterowaniu systemów mechatronicznych	mgr inż. K. Sołtys	12	Lk1	laboratoria	aktywne
07d8a3f9-7f52-4f31-b694-e6e4e23b9e75	Its1	2026-03-10	09:15:00	90	Język niemiecki	mgr E. Targosz	150SJO	Lek	laboratoria	aktywne
dd1fd21e-b801-4d10-9c61-959ccd7c20f7	Its1	2026-03-10	09:15:00	90	Język angielski	mgr E. Szabat	9	Lek1	laboratoria	aktywne
4e496f51-030d-4433-803a-b4729f45066b	Its1	2026-03-10	12:45:00	90	LabVIEW w sterowaniu systemów mechatronicznych	dr inż. T. Makowski / mgr inż. J. Zielonka	WA2	L1	laboratoria	aktywne
7581ede0-74a8-4650-8e23-4a6464f7a5f2	Its1	2026-03-10	14:30:00	90	Sensory w układach automatyki i robotyki	prof. K. Tomczyk / dr inż. M. Sieja	208B	L1	laboratoria	aktywne
3b613455-8e47-4e2c-9003-f5fc31c8e6bd	Its1	2026-03-10	16:15:00	90	Sensory w układach automatyki i robotyki	prof. K. Tomczyk	A1	W	wykład	aktywne
839213a6-2a2c-43dc-93f7-7d57524ab295	Its1	2026-03-11	10:00:00	135	Sterowanie i programowanie robotów stacjonarnych	dr inż. M. Sieja	11	L1	laboratoria	aktywne
e2ca76a1-46f4-4ec0-a51c-7b2620af9c2c	Its1	2026-03-11	12:30:00	90	Metody komputerowe w analizie i syntezie układów mechatronicznych	mgr inż. P. Tofilski	13	Lk1	laboratoria	aktywne
ed8ac010-4b0c-40b2-84e6-9bec9c179ac0	Its1	2026-03-12	09:15:00	90	Zintegrowane systemy sterowania w budownictwie	dr inż. A. Romańska	A2	W	wykład	aktywne
e9a7dc33-7b2e-43e4-8d53-7d5b22c51e48	Its1	2026-03-12	11:00:00	90	Zintegrowane systemy sterowania w budownictwie	dr inż. A. Romańska	WA201	L1	laboratoria	aktywne
44190325-9fd5-4b2d-899d-ca61c5e61577	Its1	2026-03-12	12:45:00	135	Historyczne i filozoficzne aspekty techniki	prof. K. Kluszczyński	9	W	wykład	aktywne
2f612844-f01d-4e73-89ac-9996b1afd453	Its1	2026-03-12	16:45:00	90	Jednostki sterujące systemów mechatronicznych i ich programowanie	dr inż. K. Suchenia	A3	W	wykład	aktywne
2e3f6c06-d231-47b4-8659-3c6658737eaf	Its1	2026-03-12	18:30:00	90	Jednostki sterujące systemów mechatronicznych i ich programowanie	dr inż. K. Suchenia	208E	L1	laboratoria	aktywne
91938395-659a-4a85-a3a3-26ae4ee839d7	Its1	2026-03-13	07:30:00	90	Wbudowane systemy sterowania	dr inż. D. Dorota	A3	W	wykład	aktywne
37395e9e-14fd-4f0d-ab7c-6c46cf9c4b4c	Its1	2026-03-13	09:15:00	90	Wbudowane systemy sterowania	dr inż. D. Dorota	208G	L1	laboratoria	aktywne
bffb5dcf-baa4-4ac2-8418-e4f0a408b5b2	Its1	2026-03-13	14:15:00	90	Wybrane metody obliczeniowe inżynierii	prof. V. Samotyy	10	W	wykład	aktywne
6f29602b-49e9-44d2-924d-3587134d501f	Its1	2026-03-16	11:00:00	90	Technologie IoT	dr inż. P. Król	201	Lk1	laboratoria	aktywne
0122ef13-a008-4238-81f7-8916fd4a31f0	Its1	2026-03-16	12:45:00	90	Inżynieria materiałowa w Infotronice	dr inż. S. Bartel / mgr inż. K. Sołtys	10	W	wykład	aktywne
84d01c2d-ac7f-4057-ab08-cbee67383637	Its1	2026-03-17	09:15:00	90	Język niemiecki	mgr E. Targosz	150SJO	Lek	laboratoria	aktywne
7acf8174-4990-412b-b1e2-8272d8ee809d	Its1	2026-03-17	09:15:00	90	Język angielski	mgr E. Szabat	9	Lek1	laboratoria	aktywne
d97bf28b-11d2-400e-95c0-c97d7e8572a2	Its1	2026-03-17	12:45:00	90	LabVIEW w sterowaniu systemów mechatronicznych	dr inż. T. Makowski / mgr inż. J. Zielonka	WA2	L1	laboratoria	aktywne
0ff48238-21fd-41d4-a425-371a5e94ee9f	Its1	2026-03-17	14:30:00	90	Sensory w układach automatyki i robotyki	prof. K. Tomczyk	208B	P1	laboratoria	aktywne
425231e1-922a-453f-a2b1-6f7c283ff3cb	Its1	2026-03-17	16:15:00	90	Sterowanie i programowanie robotów stacjonarnych	dr inż. M. Sieja	A1	W	wykład	aktywne
dbab6fb8-4b89-47e5-a3ad-8632dd62722b	Its1	2026-03-18	10:00:00	135	Sterowanie i programowanie robotów stacjonarnych	dr inż. M. Sieja	11	L1	laboratoria	aktywne
dfc4985a-5fd7-40e1-9f15-6009427de0f9	Its1	2026-03-18	12:30:00	90	Metody komputerowe w analizie i syntezie układów mechatronicznych	mgr inż. P. Tofilski	13	Lk1	laboratoria	aktywne
c578bf03-e1bd-4fb9-b1d5-1a3d270ff120	Its1	2026-03-19	12:45:00	135	Historyczne i filozoficzne aspekty techniki	prof. K. Kluszczyński	9	W	wykład	aktywne
e44e45cb-c5c5-4a4b-a17d-2e165d2fa5a9	Its1	2026-03-19	16:45:00	90	Metody komputerowe w analizie i syntezie układów mechatronicznych	dr inż. S. Bartel / mgr inż. P. Tofilski	10	W	wykład	aktywne
1786a638-0fa2-4ca9-974a-ff7799a37a1a	Its1	2026-03-19	18:30:00	90	Jednostki sterujące systemów mechatronicznych i ich programowanie	dr inż. K. Suchenia	208E	L1	laboratoria	aktywne
67ff4b49-c32b-4a77-9fa0-d133cf5ebe53	Its1	2026-03-20	09:15:00	90	Skanowanie, obrazowanie i szybkie prototypowanie elemntów mechatroniki	dr inż. Z. Pilch / mgr inż. M. Gibas	WA203	L1	laboratoria	aktywne
91e3a3ac-2b55-4ba4-863b-c3c3b6d4cc8e	Its1	2026-03-20	11:00:00	90	Skanowanie, obrazowanie i szybkie prototypowanie elemntów mechatroniki	dr inż. Z. Pilch / mgr inż. M. Gibas	WA203	Lk1	laboratoria	aktywne
46ec2824-aa2b-4250-8dd3-daf9df798808	Its1	2026-03-20	12:45:00	90	Skanowanie, obrazowanie i szybkie prototypowanie elemntów mechatroniki	dr inż. Z. Pilch	9	W	wykład	aktywne
1ce67b55-d461-4177-b9cf-208fd4f95ab8	Its1	2026-03-23	09:15:00	90	Technologie IoT	dr inż. P. Król	201	W	wykład	aktywne
d35bd810-9c9a-4ba1-8280-71f637e7e23f	Its1	2026-03-23	11:00:00	90	Technologie IoT	dr inż. P. Król	201	Lk1	laboratoria	aktywne
cc5c1b79-4789-4c6a-9a9a-cd0daa362f0f	Its1	2026-03-23	12:45:00	90	Inżynieria materiałowa w Infotronice	dr inż. S. Bartel / mgr inż. K. Sołtys	10	W	wykład	aktywne
dbc72c66-9306-45b3-8468-3f24fae21039	Its1	2026-03-23	14:30:00	225	LabVIEW w sterowaniu systemów mechatronicznych	mgr inż. K. Sołtys	12	Lk1	laboratoria	aktywne
94805ab9-3e41-4572-a563-fba258fac054	Its1	2026-03-24	09:15:00	90	Język niemiecki	mgr E. Targosz	150SJO	Lek	laboratoria	aktywne
d1da7e0c-9117-475f-8acf-98690d208ac0	Its1	2026-03-24	09:15:00	90	Język angielski	mgr E. Szabat	9	Lek1	laboratoria	aktywne
d0066c4b-0f86-431f-993b-0c5cb6bddb62	Its1	2026-03-24	12:45:00	90	LabVIEW w sterowaniu systemów mechatronicznych	dr inż. T. Makowski / mgr inż. J. Zielonka	WA2	L1	laboratoria	aktywne
adc3069e-7d1f-4709-8e49-a59aa70330d0	Its1	2026-03-24	14:30:00	90	Sensory w układach automatyki i robotyki	prof. K. Tomczyk / dr inż. M. Sieja	208B	L1	laboratoria	aktywne
0379692f-24c1-4761-91b0-a84974447c44	Its1	2026-03-24	16:15:00	90	Sensory w układach automatyki i robotyki	prof. K. Tomczyk	A1	W	wykład	aktywne
1b625352-6b30-4623-9fed-7acc2112c4c2	Its1	2026-03-25	10:00:00	135	Sterowanie i programowanie robotów stacjonarnych	dr inż. M. Sieja	11	L1	laboratoria	aktywne
db9ed6fd-306c-446d-8f11-0ac77de1430a	Its1	2026-03-25	12:30:00	90	Metody komputerowe w analizie i syntezie układów mechatronicznych	mgr inż. P. Tofilski	13	Lk1	laboratoria	aktywne
9d847815-640e-4436-a1a9-3a7c6a12d55d	Its1	2026-03-26	09:15:00	90	Zintegrowane systemy sterowania w budownictwie	dr inż. A. Romańska	A2	W	wykład	aktywne
dceb95a5-6162-4da3-9c28-fe79343879e4	Its1	2026-03-26	11:00:00	90	Zintegrowane systemy sterowania w budownictwie	dr inż. A. Romańska	WA201	L1	laboratoria	aktywne
6f1e0953-262d-4d30-893e-57ead3afdfaa	Its1	2026-03-26	12:45:00	135	Historyczne i filozoficzne aspekty techniki	prof. K. Kluszczyński	9	W	wykład	aktywne
5533b3ad-6c74-4cb6-bd0b-e6e05776dea4	Its1	2026-03-26	16:45:00	90	Jednostki sterujące systemów mechatronicznych i ich programowanie	dr inż. K. Suchenia	A3	W	wykład	aktywne
ba1863bb-1ca2-462c-943b-ed9e6165248b	Its3	2026-04-04	07:00:00	900	Przerwa świąteczna	Brak	-	Wszystkie grupy	święto	wolne
197b67ae-89c0-47ca-9f17-5bf27a9b391c	Its1	2026-03-26	18:30:00	90	Jednostki sterujące systemów mechatronicznych i ich programowanie	dr inż. K. Suchenia	208E	L1	laboratoria	aktywne
3b61d9e6-626c-4055-8e08-21ac400eeb8b	Its1	2026-03-27	07:30:00	90	Wbudowane systemy sterowania	dr inż. D. Dorota	A3	W	wykład	aktywne
ca2e70dc-8ec2-4dc0-b59f-2ec005e502da	Its1	2026-03-27	09:15:00	90	Wbudowane systemy sterowania	dr inż. D. Dorota	208G	L1	laboratoria	aktywne
d7e49514-6c7a-4a80-b42c-d13962a36592	Its1	2026-03-27	14:15:00	90	Wybrane metody obliczeniowe inżynierii	prof. V. Samotyy	10	W	wykład	aktywne
5ec7c6a7-212e-4299-b8bd-549bf505cd6a	Its1	2026-03-30	11:00:00	90	Technologie IoT	dr inż. P. Król	201	Lk1	laboratoria	aktywne
156394b2-3300-4fb5-a25c-cf8716898c8d	Its1	2026-03-30	12:45:00	90	Inżynieria materiałowa w Infotronice	dr inż. S. Bartel / mgr inż. K. Sołtys	10	W	wykład	aktywne
15c3db46-1965-4992-9e9b-2a56d3253dff	Its1	2026-03-31	09:15:00	90	Język niemiecki	mgr E. Targosz	150SJO	Lek	laboratoria	aktywne
c6f6b5d4-3c99-4c02-b36a-e73516903145	Its1	2026-03-31	09:15:00	90	Język angielski	mgr E. Szabat	9	Lek1	laboratoria	aktywne
210c36d7-1eb5-41a1-9550-436ec92f314c	Its1	2026-03-31	12:45:00	90	LabVIEW w sterowaniu systemów mechatronicznych	dr inż. T. Makowski / mgr inż. J. Zielonka	WA2	L1	laboratoria	aktywne
cc80b178-47cb-4b58-b099-c31433d135c4	Its1	2026-03-31	14:30:00	90	Sensory w układach automatyki i robotyki	prof. K. Tomczyk	208B	P1	laboratoria	aktywne
f7c61b88-368c-4c5a-b9ca-b49f447e1ece	Its1	2026-03-31	16:15:00	45	Sterowanie i programowanie robotów stacjonarnych	dr inż. M. Sieja	A1	W	wykład	aktywne
bcf303a9-c0b0-4a5a-a699-2df021f8cbe4	Its1	2026-04-01	07:00:00	900	Przerwa świąteczna	Brak	-	Wszystkie grupy	święto	wolne
fa7f7c77-87df-4d24-a92a-9004d230c2b6	Its1	2026-04-02	07:00:00	900	Przerwa świąteczna	Brak	-	Wszystkie grupy	święto	wolne
c5c27185-f0aa-42d0-878a-e4c91e0683b5	Its1	2026-04-03	07:00:00	900	Przerwa świąteczna	Brak	-	Wszystkie grupy	święto	wolne
c6d17598-cece-46b0-9fa7-d381256dc625	Its1	2026-04-04	07:00:00	900	Przerwa świąteczna	Brak	-	Wszystkie grupy	święto	wolne
bf4af6d3-95ab-455b-9a73-335d33f5c448	Its1	2026-04-05	07:00:00	900	Przerwa świąteczna	Brak	-	Wszystkie grupy	święto	wolne
d3919c57-10e8-4828-8cc4-b7fa3f65e954	Its1	2026-04-06	07:00:00	900	Przerwa świąteczna	Brak	-	Wszystkie grupy	święto	wolne
dfc76382-fa48-42cf-936b-4715fa142b49	Its1	2026-04-07	07:00:00	900	Przerwa świąteczna	Brak	-	Wszystkie grupy	święto	wolne
042b6abf-ebbf-45b5-a948-c676f92906cd	Its1	2026-04-08	10:00:00	135	Sterowanie i programowanie robotów stacjonarnych	dr inż. M. Sieja	11	L1	laboratoria	aktywne
a0b5ed3b-bc8e-4f9c-97c7-0c3f645187b0	Its1	2026-04-08	12:30:00	90	Metody komputerowe w analizie i syntezie układów mechatronicznych	mgr inż. P. Tofilski	13	Lk1	laboratoria	aktywne
1a309edd-e795-4aac-a3f4-49dff53ec796	Its1	2026-04-09	09:15:00	90	Zintegrowane systemy sterowania w budownictwie	dr inż. A. Romańska	A2	W	wykład	aktywne
8078a710-462c-41ef-a9c3-2d06744c4228	Its1	2026-04-09	11:00:00	90	Zintegrowane systemy sterowania w budownictwie	dr inż. A. Romańska	WA201	L1	laboratoria	aktywne
6f126001-5733-4f7a-8e55-457cb43d8a3e	Its1	2026-04-09	12:45:00	135	Historyczne i filozoficzne aspekty techniki	prof. K. Kluszczyński	9	W	wykład	aktywne
6120596f-13b6-4352-934a-ec4e03c1933a	Its1	2026-04-09	16:45:00	90	Jednostki sterujące systemów mechatronicznych i ich programowanie	dr inż. K. Suchenia	A3	W	wykład	aktywne
c9c7e11f-7587-4d46-97f7-97d0b08e39d5	Its1	2026-04-09	18:30:00	90	Jednostki sterujące systemów mechatronicznych i ich programowanie	dr inż. K. Suchenia	208E	L1	laboratoria	aktywne
a41b493c-49fc-45be-ad6b-6cb3f5df5c98	Its1	2026-04-10	07:30:00	90	Wbudowane systemy sterowania	dr inż. D. Dorota	A3	W	wykład	aktywne
d5245895-dd88-4fc3-b65b-0c0ed6f52880	Its1	2026-04-10	09:15:00	90	Wbudowane systemy sterowania	dr inż. D. Dorota	208G	L1	laboratoria	aktywne
e219f88f-5416-4159-9222-ce6be6974acf	Its1	2026-04-10	14:15:00	90	Wybrane metody obliczeniowe inżynierii	prof. V. Samotyy	10	W	wykład	aktywne
b4f2111f-71f0-4a98-b87a-3ee1c911a025	Its1	2026-04-13	11:00:00	90	Technologie IoT	dr inż. P. Król	201	Lk1	laboratoria	aktywne
cef56979-0d46-46ea-99ba-7184390ed312	Its1	2026-04-13	12:45:00	90	Inżynieria materiałowa w Infotronice	dr inż. S. Bartel / mgr inż. K. Sołtys	10	W	wykład	aktywne
a43fd725-ce5f-4df8-9335-f34d065c9ad7	Its1	2026-04-14	09:15:00	90	Język niemiecki	mgr E. Targosz	150SJO	Lek	laboratoria	aktywne
ccbff5a2-2780-4a04-8816-cd8a60e6544e	Its1	2026-04-14	09:15:00	90	Język angielski	mgr E. Szabat	9	Lek1	laboratoria	aktywne
d9c5b07e-3035-4c1e-a19f-694ae0693819	Its1	2026-04-14	12:45:00	90	LabVIEW w sterowaniu systemów mechatronicznych	dr inż. T. Makowski / mgr inż. J. Zielonka	WA2	L1	laboratoria	aktywne
519e465b-4fa3-4a1e-9e6e-9e2b49528497	Its1	2026-04-14	14:30:00	90	Sensory w układach automatyki i robotyki	prof. K. Tomczyk	208B	P1	laboratoria	aktywne
17970cf2-f0d0-47a9-9e6e-a6060d1ca2e2	Its1	2026-04-15	10:00:00	135	Sterowanie i programowanie robotów stacjonarnych	dr inż. M. Sieja	11	L1	laboratoria	aktywne
ecefa440-819c-418b-9d39-3aabc361f60a	Its1	2026-04-15	12:30:00	90	Metody komputerowe w analizie i syntezie układów mechatronicznych	mgr inż. P. Tofilski	13	Lk1	laboratoria	aktywne
a9d0f964-7f3c-4265-b919-4f84954c8c5d	Its1	2026-04-16	12:45:00	135	Historyczne i filozoficzne aspekty techniki	prof. K. Kluszczyński	9	W	wykład	aktywne
857301cb-d177-4640-9497-a560f4981801	Its1	2026-04-16	16:45:00	90	Metody komputerowe w analizie i syntezie układów mechatronicznych	dr inż. S. Bartel / mgr inż. P. Tofilski	10	W	wykład	aktywne
6799c82a-f6e7-4733-bd8b-5fc87dbef765	Its1	2026-04-16	18:30:00	90	Jednostki sterujące systemów mechatronicznych i ich programowanie	dr inż. K. Suchenia	208E	L1	laboratoria	aktywne
0d760e04-00bf-4f51-a98a-53eae87d3e3c	Its1	2026-04-17	08:30:00	135	Skanowanie, obrazowanie i szybkie prototypowanie elemntów mechatroniki	dr inż. Z. Pilch / mgr inż. M. Gibas	WA203	L1	laboratoria	aktywne
6665a4b2-cb2c-4109-bc05-9143d2dee444	Its1	2026-04-17	11:00:00	90	Skanowanie, obrazowanie i szybkie prototypowanie elemntów mechatroniki	dr inż. Z. Pilch / mgr inż. M. Gibas	WA203	Lk1	laboratoria	aktywne
a01e792e-9e21-426d-a669-3daa256fa7bf	Its1	2026-04-17	12:45:00	90	Skanowanie, obrazowanie i szybkie prototypowanie elemntów mechatroniki	dr inż. Z. Pilch	9	W	wykład	aktywne
cc3ad257-c36e-404c-95dd-262559fc099e	Its1	2026-04-20	09:15:00	90	Technologie IoT	dr inż. P. Król	201	W	wykład	aktywne
bcbdd463-262d-4a05-9369-922a56fcd848	Its1	2026-04-20	11:00:00	90	Technologie IoT	dr inż. P. Król	201	Lk1	laboratoria	aktywne
a34e6e50-b349-4942-a296-762622d183fc	Its1	2026-04-20	12:45:00	90	Inżynieria materiałowa w Infotronice	dr inż. S. Bartel / mgr inż. K. Sołtys	10	W	wykład	aktywne
6332a134-d112-4064-bfb6-e032d2432f42	Its1	2026-04-20	14:30:00	180	LabVIEW w sterowaniu systemów mechatronicznych	mgr inż. K. Sołtys	12	Lk1	laboratoria	aktywne
c67a8a90-6aee-465a-9f07-639944c9bbfc	Its1	2026-04-21	09:15:00	90	Język niemiecki	mgr E. Targosz	150SJO	Lek	laboratoria	aktywne
26a58c72-a436-4bab-a885-718d4b9432e4	Its1	2026-04-21	09:15:00	90	Język angielski	mgr E. Szabat	9	Lek1	laboratoria	aktywne
101a63a4-0a5e-4ae3-9712-ccd8860cf402	Its1	2026-04-21	12:45:00	90	LabVIEW w sterowaniu systemów mechatronicznych	dr inż. T. Makowski / mgr inż. J. Zielonka	WA2	L1	laboratoria	aktywne
a41d2bcf-5b31-4023-a09d-d801e641ae76	Its1	2026-04-21	14:30:00	90	Sensory w układach automatyki i robotyki	prof. K. Tomczyk / dr inż. M. Sieja	208B	L1	laboratoria	aktywne
306e0e1f-5038-4022-8bd1-2f6fc6453034	Its1	2026-04-22	10:00:00	135	Sterowanie i programowanie robotów stacjonarnych	dr inż. M. Sieja	11	L1	laboratoria	aktywne
d4466bdb-74ef-4542-ba3c-9178b8d935ac	Its1	2026-04-23	09:15:00	90	Zintegrowane systemy sterowania w budownictwie	dr inż. A. Romańska	A2	W	wykład	aktywne
479c158f-f4a5-43f3-97f4-02652dd638f5	Its1	2026-04-23	11:00:00	90	Zintegrowane systemy sterowania w budownictwie	dr inż. A. Romańska	WA201	L1	laboratoria	aktywne
bfdd51e5-c1f8-4d5d-a653-238b3f57b3cc	Its1	2026-04-23	12:45:00	135	Historyczne i filozoficzne aspekty techniki	prof. K. Kluszczyński	9	W	wykład	aktywne
9b7476b7-77f6-46c4-ade6-b0f867e1084e	Its1	2026-04-23	16:45:00	90	Jednostki sterujące systemów mechatronicznych i ich programowanie	dr inż. K. Suchenia	A3	W	wykład	aktywne
5a72c03b-3586-4993-b8a3-b409efcee1f0	Its1	2026-04-23	18:30:00	90	Jednostki sterujące systemów mechatronicznych i ich programowanie	dr inż. K. Suchenia	208E	L1	laboratoria	aktywne
7c083851-c617-4b52-a430-f91d55bec2a0	Its1	2026-04-24	07:30:00	90	Wbudowane systemy sterowania	dr inż. D. Dorota	A3	W	wykład	aktywne
50c61b50-27fb-4f80-b19f-f7f517a3f571	Its1	2026-04-24	09:15:00	90	Wbudowane systemy sterowania	dr inż. D. Dorota	208G	L1	laboratoria	aktywne
b423642a-d3e1-4f67-b2d3-c36a23d08c8e	Its1	2026-04-24	14:15:00	90	Wybrane metody obliczeniowe inżynierii	prof. V. Samotyy	10	W	wykład	aktywne
3ebce8d0-9f49-45b5-ae30-dd157c80e373	Its1	2026-04-27	11:00:00	90	Technologie IoT	dr inż. P. Król	201	Lk1	laboratoria	aktywne
434eea3e-ca4f-4921-a633-733052b7066b	Its1	2026-04-28	09:15:00	90	Język niemiecki	mgr E. Targosz	150SJO	Lek	laboratoria	aktywne
8803d8dd-0db3-4953-bbf5-a27574cc83ef	Its1	2026-04-28	09:15:00	90	Język angielski	mgr E. Szabat	9	Lek1	laboratoria	aktywne
8136f565-799c-4dfe-837c-7135cc529d8b	Its1	2026-04-28	12:45:00	90	LabVIEW w sterowaniu systemów mechatronicznych	dr inż. T. Makowski / mgr inż. J. Zielonka	WA2	L1	laboratoria	aktywne
5f1b0bc8-1f2f-4e6b-9d55-7e2baf696ea0	Its1	2026-04-28	14:30:00	90	Sensory w układach automatyki i robotyki	prof. K. Tomczyk	208B	P1	laboratoria	aktywne
aae24050-4cbf-4ec9-a556-18b22022b001	Its1	2026-04-29	10:00:00	135	Sterowanie i programowanie robotów stacjonarnych	dr inż. M. Sieja	11	L1	laboratoria	aktywne
8a57d8e3-82af-47e3-9216-7aa69c229959	Its1	2026-04-30	12:45:00	135	Historyczne i filozoficzne aspekty techniki	prof. K. Kluszczyński	9	W	wykład	aktywne
70fa3192-dc2e-4c79-bf41-e6fc4d58aa2e	Its1	2026-04-30	16:45:00	90	Metody komputerowe w analizie i syntezie układów mechatronicznych	dr inż. S. Bartel / mgr inż. P. Tofilski	10	W	wykład	aktywne
e93fcd7a-72a7-4d94-8fc5-695b58a3deef	Its1	2026-04-30	18:30:00	90	Jednostki sterujące systemów mechatronicznych i ich programowanie	dr inż. K. Suchenia	208E	L1	laboratoria	aktywne
a67832e5-9622-448f-8647-5be1523812c0	Its1	2026-05-01	07:00:00	900	Majówka	Brak	-	Wszystkie grupy	święto	wolne
8a30db98-c125-422e-bf75-16826d24d63e	Its1	2026-05-02	07:00:00	900	Majówka	Brak	-	Wszystkie grupy	święto	wolne
bbf8763f-06b9-4d32-b514-fbc93ef0bf59	Its1	2026-05-03	07:00:00	900	Majówka	Brak	-	Wszystkie grupy	święto	wolne
8d7074f9-9bf1-4998-88bb-df38823b5628	Its1	2026-05-04	07:00:00	900	Majówka	Brak	-	Wszystkie grupy	święto	wolne
73cb065c-00ed-4eae-b7ef-c9f6cd8d6d2f	Its1	2026-05-05	09:15:00	90	Język niemiecki	mgr E. Targosz	150SJO	Lek	laboratoria	aktywne
3e652079-affc-4a40-8966-c19c99b75e6c	Its1	2026-05-05	09:15:00	90	Język angielski	mgr E. Szabat	9	Lek1	laboratoria	aktywne
8d9d99e2-84fe-4941-9400-cd0222f3486c	Its1	2026-05-05	12:45:00	90	LabVIEW w sterowaniu systemów mechatronicznych	dr inż. T. Makowski / mgr inż. J. Zielonka	WA2	L1	laboratoria	aktywne
801b4984-c109-48f6-a7b3-b06afa8be3d3	Its1	2026-05-05	14:30:00	90	Sensory w układach automatyki i robotyki	prof. K. Tomczyk / dr inż. M. Sieja	208B	L1	laboratoria	aktywne
3038b99a-8e90-4be1-a9a5-921b247be41c	Its1	2026-05-05	16:15:00	90	Sensory w układach automatyki i robotyki	prof. K. Tomczyk	A1	W	wykład	aktywne
32407e72-31da-4086-896c-cf231d6f4a04	Its1	2026-05-06	10:00:00	135	Sterowanie i programowanie robotów stacjonarnych	dr inż. M. Sieja	11	L1	laboratoria	aktywne
6416bcf1-24c2-44c1-a02b-4eeac45a6525	Its1	2026-05-07	11:00:00	90	Zintegrowane systemy sterowania w budownictwie	dr inż. A. Romańska	WA201	L1	laboratoria	aktywne
bc42c901-5483-454b-bc6b-0c63d72fabcb	Its1	2026-05-07	12:45:00	135	Historyczne i filozoficzne aspekty techniki	prof. K. Kluszczyński	9	W	wykład	aktywne
f9ecc99b-ceed-4503-85bc-f98a794884d2	Its1	2026-05-07	16:45:00	90	Jednostki sterujące systemów mechatronicznych i ich programowanie	dr inż. K. Suchenia	A3	W	wykład	aktywne
61a6c2c2-e46e-4427-a2ed-882d06cbad79	Its1	2026-05-07	18:30:00	90	Jednostki sterujące systemów mechatronicznych i ich programowanie	dr inż. K. Suchenia	208E	L1	laboratoria	aktywne
60aa4c8e-2b56-41e0-b7ba-b2028bf821f3	Its1	2026-05-08	08:30:00	135	Wbudowane systemy sterowania	dr inż. D. Dorota	208G	L1	laboratoria	aktywne
f1713bbc-902b-42f5-9bdb-6e7e1be04b24	Its1	2026-05-08	14:15:00	90	Wybrane metody obliczeniowe inżynierii	prof. V. Samotyy	10	W	wykład	aktywne
5958367c-e138-451b-a77f-ab0496582faf	Its1	2026-05-11	11:00:00	90	Technologie IoT	dr inż. P. Król	201	Lk1	laboratoria	aktywne
e3097dc3-746c-4834-9936-d7fd2df5ba9d	Its1	2026-05-12	07:00:00	900	Święto Szkoły	Brak	-	Wszystkie grupy	święto	wolne
22536276-8a73-4b7b-aebb-4c46e5e58643	Its1	2026-05-13	10:00:00	135	Sterowanie i programowanie robotów stacjonarnych	dr inż. M. Sieja	11	L1	laboratoria	aktywne
a017b092-5ad0-4736-93c3-9e4f18720518	Its1	2026-05-14	16:45:00	90	Metody komputerowe w analizie i syntezie układów mechatronicznych	dr inż. S. Bartel / mgr inż. P. Tofilski	10	W	wykład	aktywne
15b170b3-ca7e-4704-ae55-9007c2b7153b	Its1	2026-05-14	18:30:00	90	Jednostki sterujące systemów mechatronicznych i ich programowanie	dr inż. K. Suchenia	208E	L1	laboratoria	aktywne
734e8ab5-703b-40e5-b8b5-4f5b3d1f3c54	Its1	2026-05-15	08:30:00	135	Skanowanie, obrazowanie i szybkie prototypowanie elemntów mechatroniki	dr inż. Z. Pilch / mgr inż. M. Gibas	WA203	L1	laboratoria	aktywne
6157d512-ea82-45f0-8ed2-6502fa88d632	Its1	2026-05-15	11:00:00	135	Skanowanie, obrazowanie i szybkie prototypowanie elemntów mechatroniki	dr inż. Z. Pilch / mgr inż. M. Gibas	WA203	Lk1	laboratoria	aktywne
b44a15fd-16ae-4ced-9324-2824dc75435a	Its1	2026-05-15	13:30:00	90	Skanowanie, obrazowanie i szybkie prototypowanie elemntów mechatroniki	dr inż. Z. Pilch	9	W	wykład	aktywne
fc96f693-9734-4370-b0af-df9efc91a95d	Its1	2026-05-18	09:15:00	90	Technologie IoT	dr inż. P. Król	201	W	wykład	aktywne
82f68607-342a-4fda-a78e-3ecbbeccfb63	Its1	2026-05-18	11:00:00	90	Technologie IoT	dr inż. P. Król	201	Lk1	laboratoria	aktywne
4f7c3771-6234-46b6-bffa-45a7834450e9	Its1	2026-05-18	14:30:00	180	LabVIEW w sterowaniu systemów mechatronicznych	mgr inż. K. Sołtys	12	Lk1	laboratoria	aktywne
81e05845-a79b-431d-929e-1e0932e65a87	Its1	2026-05-19	09:15:00	90	Język niemiecki	mgr E. Targosz	150SJO	Lek	laboratoria	aktywne
c8d40626-4bdc-4723-9877-e3c8932233c5	Its1	2026-05-19	09:15:00	90	Język angielski	mgr E. Szabat	9	Lek1	laboratoria	aktywne
31e6e5b1-a45e-462d-8b33-584235137861	Its1	2026-05-19	14:30:00	90	Sensory w układach automatyki i robotyki	prof. K. Tomczyk / dr inż. M. Sieja	208B	L1	laboratoria	aktywne
352b521b-08b9-489a-abf8-ab01dc2194c7	Its1	2026-05-20	10:00:00	135	Sterowanie i programowanie robotów stacjonarnych	dr inż. M. Sieja	11	L1	laboratoria	aktywne
46e53ed6-65f9-439c-848c-d7ff8b736f64	Its1	2026-05-21	10:15:00	135	Zintegrowane systemy sterowania w budownictwie	dr inż. A. Romańska	WA201	L1	laboratoria	aktywne
5bfd30b2-7e9a-4760-93fc-51c034171fad	Its1	2026-05-21	16:45:00	90	Jednostki sterujące systemów mechatronicznych i ich programowanie	dr inż. K. Suchenia	A3	W	wykład	aktywne
fcd6b906-8b59-451b-bf7a-1234199a6543	Its1	2026-05-21	18:30:00	90	Jednostki sterujące systemów mechatronicznych i ich programowanie	dr inż. K. Suchenia	208E	L1	laboratoria	aktywne
28ddf262-6624-4fa7-b765-d29c18024187	Its1	2026-05-22	09:15:00	90	Wbudowane systemy sterowania	dr inż. D. Dorota	208G	L1	laboratoria	aktywne
68451894-24fc-484e-935d-1e6ab4d59be4	Its1	2026-05-22	14:15:00	90	Wybrane metody obliczeniowe inżynierii	prof. V. Samotyy	10	W	wykład	aktywne
10cf1778-03ca-40c1-968d-a1b45911da79	Its1	2026-05-24	07:00:00	900	Zielone Świątki	Brak	-	Wszystkie grupy	święto	wolne
184cbab2-0e6d-467e-8a57-d94071c32faf	Its1	2026-05-25	11:00:00	90	Technologie IoT	dr inż. P. Król	201	Lk1	laboratoria	aktywne
198e7b3d-858c-467e-b892-506c92566b8b	Its1	2026-05-26	09:15:00	90	Język niemiecki	mgr E. Targosz	150SJO	Lek	laboratoria	aktywne
b28a71f6-c3a3-4b2f-85f8-70c3f51a3157	Its1	2026-05-26	09:15:00	90	Język angielski	mgr E. Szabat	9	Lek1	laboratoria	aktywne
b2a9b818-a645-417c-bd5f-23925e7cb057	Its1	2026-05-27	10:00:00	135	Sterowanie i programowanie robotów stacjonarnych	dr inż. M. Sieja	11	L1	laboratoria	aktywne
404636a0-08d5-49a3-880c-7b4cc39a5b1d	Its1	2026-05-28	18:30:00	90	Jednostki sterujące systemów mechatronicznych i ich programowanie	dr inż. K. Suchenia	208E	L1	laboratoria	aktywne
abee0769-6398-4ebc-bb18-8ba0f8f2b737	Its1	2026-05-29	08:30:00	135	Skanowanie, obrazowanie i szybkie prototypowanie elemntów mechatroniki	dr inż. Z. Pilch / mgr inż. M. Gibas	WA203	L1	laboratoria	aktywne
5a3117d4-9b72-4004-ae30-0ec161645560	Its1	2026-05-29	11:00:00	135	Skanowanie, obrazowanie i szybkie prototypowanie elemntów mechatroniki	dr inż. Z. Pilch / mgr inż. M. Gibas	WA203	Lk1	laboratoria	aktywne
052572ea-11f2-48cc-b96b-fdd540149e52	Its1	2026-05-29	13:30:00	90	Skanowanie, obrazowanie i szybkie prototypowanie elemntów mechatroniki	dr inż. Z. Pilch	9	W	wykład	aktywne
e3486239-11b0-4204-9fe9-6f72668863ac	Its1	2026-06-01	09:15:00	90	Technologie IoT	dr inż. P. Król	201	W	wykład	aktywne
bb871a19-15bf-4f11-aa3d-be22e0c537fa	Its1	2026-06-01	11:00:00	90	Technologie IoT	dr inż. P. Król	201	Lk1	laboratoria	aktywne
29e0866b-02e2-402a-9b58-390e60601308	Its1	2026-06-01	14:30:00	180	LabVIEW w sterowaniu systemów mechatronicznych	mgr inż. K. Sołtys	12	Lk1	laboratoria	aktywne
a7ff2e19-2927-46bc-90cd-f6e8ad7fa1ce	Its1	2026-06-02	09:15:00	90	Język niemiecki	mgr E. Targosz	150SJO	Lek	laboratoria	aktywne
135e164d-9d13-4bdc-9abf-2d06ffa700c9	Its1	2026-06-02	09:15:00	90	Język angielski	mgr E. Szabat	9	Lek1	laboratoria	aktywne
e9b73139-700d-4370-8e6a-0450cdff154a	Its1	2026-06-02	14:30:00	90	Sensory w układach automatyki i robotyki	prof. K. Tomczyk / dr inż. M. Sieja	208B	L1	laboratoria	aktywne
73f15a26-6153-4b32-a4f8-de161d3e4be4	Its1	2026-06-04	07:00:00	900	Boże Ciało	Brak	-	Wszystkie grupy	święto	wolne
89ff8f89-bdd9-409d-8b6d-ba88b1058c6a	Its1	2026-06-05	07:00:00	900	Boże Ciało	Brak	-	Wszystkie grupy	święto	wolne
ec5bbb8b-923b-4c27-a8b2-755471d81658	Its1	2026-06-09	09:15:00	90	Język niemiecki	mgr E. Targosz	150SJO	Lek	laboratoria	aktywne
628f05c7-7d0d-466b-aac2-7207985a2220	Its1	2026-06-09	09:15:00	90	Język angielski	mgr E. Szabat	9	Lek1	laboratoria	aktywne
6f782376-7edb-4760-8473-fd21079bcab7	Its1	2026-06-12	09:15:00	90	Skanowanie, obrazowanie i szybkie prototypowanie elemntów mechatroniki	dr inż. Z. Pilch / mgr inż. M. Gibas	WA203	L1	laboratoria	aktywne
8edc280a-bce9-4149-83d7-0e14900aa7ce	Its1	2026-06-12	11:00:00	135	Skanowanie, obrazowanie i szybkie prototypowanie elemntów mechatroniki	dr inż. Z. Pilch / mgr inż. M. Gibas	WA203	Lk1	laboratoria	aktywne
ffd4bd09-1157-4302-966f-ff60874d7737	Its1	2026-06-15	09:15:00	90	Technologie IoT	dr inż. P. Król	201	W	wykład	aktywne
3b078537-3e57-4b9c-b924-349d5d7f77b9	Its1	2026-06-15	14:30:00	180	LabVIEW w sterowaniu systemów mechatronicznych	mgr inż. K. Sołtys	12	Lk1	laboratoria	aktywne
4f156fbf-9dec-4482-8dfb-f11582e8490d	Its1	2026-06-16	09:15:00	90	Język niemiecki	mgr E. Targosz	150SJO	Lek	laboratoria	aktywne
1910fb39-d901-4734-be78-ba9c3929a209	Its1	2026-06-16	09:15:00	90	Język angielski	mgr E. Szabat	9	Lek1	laboratoria	aktywne
e3be0ffb-8289-497f-86c9-5bf56cda7b03	Its1	2026-06-16	14:30:00	90	Sensory w układach automatyki i robotyki	prof. K. Tomczyk / dr inż. M. Sieja	208B	L1	laboratoria	aktywne
febcf595-a511-4308-8927-f430885bceb4	Its3	2026-02-24	11:00:00	90	Nowoczesne magazyny energii	mgr inż. K. Sołtys	12	P2	laboratoria	aktywne
f185ec67-44e2-4eb0-9902-f7e6b6a650c7	Its3	2026-02-24	11:00:00	90	Nowoczesne magazyny energii	mgr inż. P. Tofilski	13	Lk1	laboratoria	aktywne
3e403b68-fe28-413a-8a5c-94f6998908c9	Its3	2026-02-24	12:45:00	90	Nowoczesne magazyny energii	mgr inż. K. Sołtys	12	P1	laboratoria	aktywne
4f7aec66-2be2-4d4a-8877-fe301deba213	Its3	2026-02-24	12:45:00	90	Nowoczesne magazyny energii	mgr inż. P. Tofilski	13	Lk2	laboratoria	aktywne
6863e970-6b58-43a0-9fa1-efcbc891c3a2	Its3	2026-02-24	14:30:00	135	Seminarium dyplomowe	prof. K. Kluszczyński	10	S1	laboratoria	aktywne
064813e8-7b92-4b8e-b5e3-06d737ef2c63	Its3	2026-02-25	12:45:00	90	Systemy informatyczne w zarządzaniu budynkami inteligentnymi	dr inż. A. Romańska	WA201	P1	laboratoria	aktywne
d11d0ef8-b735-478e-a96f-827159448154	Its3	2026-02-25	16:15:00	90	Systemy informatyczne w zarządzaniu budynkami inteligentnymi	dr inż. A. Romańska	WA201	P2	laboratoria	aktywne
c14f9612-e6b0-49dc-9e3e-d1afcb30b0f0	Its3	2026-02-26	09:15:00	180	Nowoczesne magazyny energii	dr inż. S. Bartel	9	W	wykład	aktywne
b24890dc-6dc3-4c7e-82e4-fb76a9c14ed5	Its3	2026-02-26	16:15:00	90	Systemy informatyczne w zarządzaniu budynkami inteligentnymi	dr inż. A. Romańska	9	W	wykład	aktywne
2a421d12-8feb-4887-be6e-343c8e0d8e75	Its3	2026-02-27	10:00:00	135	Systemy SCADA w zarządzaniu procesami przemysłowymi	prof. R. Sałat	WA2	L1	laboratoria	aktywne
3813e341-0e79-4ad4-918b-bc85c01d3150	Its3	2026-02-27	12:30:00	135	Systemy SCADA w zarządzaniu procesami przemysłowymi	prof. R. Sałat	WA2	L2	laboratoria	aktywne
06ce23c2-e237-4de9-99b0-895430ce08ae	Its3	2026-02-27	15:00:00	135	Systemy SCADA w zarządzaniu procesami przemysłowymi	prof. R. Sałat	WA2	L3	laboratoria	aktywne
324d323c-9ed7-49ff-a333-9fd62dca7b42	Its3	2026-03-03	11:00:00	90	Nowoczesne magazyny energii	mgr inż. K. Sołtys	12	P2	laboratoria	aktywne
f31254e7-2084-4553-9771-17a3e66338d9	Its3	2026-03-03	11:00:00	90	Nowoczesne magazyny energii	mgr inż. P. Tofilski	13	Lk1	laboratoria	aktywne
15481edc-923e-47ab-b79e-af0b7cece74a	Its3	2026-03-03	12:45:00	90	Nowoczesne magazyny energii	mgr inż. K. Sołtys	12	P1	laboratoria	aktywne
32af4ee4-095d-444f-a6dc-01cf2fd8f65a	Its3	2026-03-03	12:45:00	90	Nowoczesne magazyny energii	mgr inż. P. Tofilski	13	Lk2	laboratoria	aktywne
bb8bb82d-1438-41f6-b438-50319979e3b8	Its3	2026-03-03	14:30:00	135	Seminarium dyplomowe	prof. K. Kluszczyński	10	S1	laboratoria	aktywne
38d552f4-3ed3-42db-a15e-56ae48a23d88	Its3	2026-03-04	12:45:00	90	Systemy informatyczne w zarządzaniu budynkami inteligentnymi	dr inż. A. Romańska	WA201	P1	laboratoria	aktywne
ed5b0b79-9541-49f1-84b2-8673eac95166	Its3	2026-03-04	16:15:00	90	Systemy informatyczne w zarządzaniu budynkami inteligentnymi	dr inż. A. Romańska	WA201	P2	laboratoria	aktywne
1b5c83ad-80f9-42b2-afe0-43ab41ce3538	Its3	2026-03-05	09:15:00	180	Nowoczesne magazyny energii	dr inż. S. Bartel	9	W	wykład	aktywne
c27a59b5-7283-4f5e-94bd-795754a18c3e	Its3	2026-03-05	16:15:00	90	Systemy informatyczne w zarządzaniu budynkami inteligentnymi	dr inż. A. Romańska	9	W	wykład	aktywne
614a939c-19c7-4bdf-93a4-247165bc2d22	Its3	2026-03-05	18:00:00	135	Systemy SCADA w zarządzaniu procesami przemysłowymi	prof. R. Sałat	WA2	W	wykład	aktywne
e82b0598-df67-46b2-ac09-3d262d73cded	Its3	2026-03-06	10:00:00	135	Systemy SCADA w zarządzaniu procesami przemysłowymi	prof. R. Sałat	WA2	L1	laboratoria	aktywne
73ea730c-0c37-4853-abca-39f9d5cfb77e	Its3	2026-03-06	12:30:00	135	Systemy SCADA w zarządzaniu procesami przemysłowymi	prof. R. Sałat	WA2	L2	laboratoria	aktywne
0b71c604-eccf-4d81-9e37-a2cb9e9ef59a	Its3	2026-03-06	15:00:00	135	Systemy SCADA w zarządzaniu procesami przemysłowymi	prof. R. Sałat	WA2	L3	laboratoria	aktywne
0558bcfc-165b-499f-a568-4277b489e9aa	Its3	2026-03-10	11:00:00	90	Nowoczesne magazyny energii	mgr inż. K. Sołtys	12	P2	laboratoria	aktywne
10550a24-185f-4cd0-9338-77d824bb7388	Its3	2026-03-10	11:00:00	90	Nowoczesne magazyny energii	mgr inż. P. Tofilski	13	Lk1	laboratoria	aktywne
d0f18d4c-7fd5-460f-afa1-2297d0297b6b	Its3	2026-03-10	12:45:00	90	Nowoczesne magazyny energii	mgr inż. K. Sołtys	12	P1	laboratoria	aktywne
6d9a2e91-dc18-4b91-9525-e9175f7f2931	Its3	2026-03-10	12:45:00	90	Nowoczesne magazyny energii	mgr inż. P. Tofilski	13	Lk2	laboratoria	aktywne
7023acde-eb57-4762-afb8-fc7e5aa1ae08	Its3	2026-03-10	14:30:00	90	Sztuka redagowania, dyskusji i prezentacji	prof. K. Kluszczyński	10	S1	laboratoria	aktywne
e0841553-79a5-4b46-8ba3-65f2e9bf2b9b	Its3	2026-03-10	16:15:00	135	Seminarium dyplomowe	prof. K. Kluszczyński	10	S1	laboratoria	aktywne
4cff05a4-d46f-46c2-97a9-953c7e2bcdb8	Its3	2026-03-11	12:45:00	90	Systemy informatyczne w zarządzaniu budynkami inteligentnymi	dr inż. A. Romańska	WA201	P1	laboratoria	aktywne
1f47de1a-132f-4f6c-8fb0-ecceaa6cb052	Its3	2026-03-11	16:15:00	90	Systemy informatyczne w zarządzaniu budynkami inteligentnymi	dr inż. A. Romańska	WA201	P2	laboratoria	aktywne
0103ba9e-9f9d-4c5f-bad7-7bf1e52bcea8	Its3	2026-03-12	09:15:00	180	Nowoczesne magazyny energii	dr inż. S. Bartel	9	W	wykład	aktywne
7ec7e5ef-558b-40bf-87a1-e7632b27a0c9	Its3	2026-03-12	16:15:00	90	Systemy informatyczne w zarządzaniu budynkami inteligentnymi	dr inż. A. Romańska	9	W	wykład	aktywne
ba49664c-2396-444f-98e9-44e8ba9ad4b0	Its3	2026-03-13	10:00:00	135	Systemy SCADA w zarządzaniu procesami przemysłowymi	prof. R. Sałat	WA2	L1	laboratoria	aktywne
cdb1df97-7ddf-4b8d-a206-3245f1fe830d	Its3	2026-03-13	12:30:00	135	Systemy SCADA w zarządzaniu procesami przemysłowymi	prof. R. Sałat	WA2	L2	laboratoria	aktywne
85fef465-a0df-485c-9a87-29825eb5e2ea	Its3	2026-03-13	15:00:00	135	Systemy SCADA w zarządzaniu procesami przemysłowymi	prof. R. Sałat	WA2	L3	laboratoria	aktywne
82b4a8bd-e1b4-40ba-859a-af3c7bfdb9da	Its3	2026-03-17	11:00:00	90	Nowoczesne magazyny energii	mgr inż. K. Sołtys	12	P2	laboratoria	aktywne
24872a39-aaaf-457f-a97e-b608d6aec96f	Its3	2026-03-17	11:00:00	90	Nowoczesne magazyny energii	mgr inż. P. Tofilski	13	Lk1	laboratoria	aktywne
d7ba5145-d88d-4452-a68f-e45b47fd493c	Its3	2026-03-17	12:45:00	90	Nowoczesne magazyny energii	mgr inż. K. Sołtys	12	P1	laboratoria	aktywne
d3844eb8-d9a4-4b13-b633-dfefd9e4141c	Its3	2026-03-17	12:45:00	90	Nowoczesne magazyny energii	mgr inż. P. Tofilski	13	Lk2	laboratoria	aktywne
ef97a084-ccbe-4f77-9b26-62a0c4e33565	Its3	2026-03-18	12:45:00	90	Systemy informatyczne w zarządzaniu budynkami inteligentnymi	dr inż. A. Romańska	WA201	P1	laboratoria	aktywne
63c2b1fc-aacc-431e-b4c3-3626b56e2e9b	Its3	2026-03-18	16:15:00	90	Systemy informatyczne w zarządzaniu budynkami inteligentnymi	dr inż. A. Romańska	WA201	P2	laboratoria	aktywne
99fe1a46-fc9f-4cf0-8013-fc0c8e012eb9	Its3	2026-03-19	10:00:00	135	Nowoczesne magazyny energii	dr inż. S. Bartel	9	W	wykład	aktywne
e190b130-a07f-4a5a-ae9f-4e316e499a66	Its3	2026-03-19	16:15:00	90	Systemy informatyczne w zarządzaniu budynkami inteligentnymi	dr inż. A. Romańska	9	W	wykład	aktywne
e39f641e-e62b-45f0-8fd7-63221c97a292	Its3	2026-03-19	18:00:00	135	Systemy SCADA w zarządzaniu procesami przemysłowymi	prof. R. Sałat	WA2	W	wykład	aktywne
472dddd3-841b-4c20-895f-3aa4fa253931	Its3	2026-03-20	10:00:00	135	Systemy SCADA w zarządzaniu procesami przemysłowymi	prof. R. Sałat	WA2	L1	laboratoria	aktywne
90a87662-4b0d-4d02-8991-fe448a5cc947	Its3	2026-03-20	12:30:00	135	Systemy SCADA w zarządzaniu procesami przemysłowymi	prof. R. Sałat	WA2	L2	laboratoria	aktywne
a047ea93-9e67-4679-8c80-343043353edf	Its3	2026-03-20	15:00:00	135	Systemy SCADA w zarządzaniu procesami przemysłowymi	prof. R. Sałat	WA2	L3	laboratoria	aktywne
caf9e464-7c07-4172-b804-a4eed907c980	Its3	2026-03-24	11:00:00	90	Nowoczesne magazyny energii	mgr inż. K. Sołtys	12	P2	laboratoria	aktywne
31f02d47-56bc-41e1-b2b3-a8acd809e406	Its3	2026-03-24	11:00:00	90	Nowoczesne magazyny energii	mgr inż. P. Tofilski	13	Lk1	laboratoria	aktywne
dec32ed3-1ea2-493f-88c0-c9be1aa1b08a	Its3	2026-03-24	12:45:00	90	Nowoczesne magazyny energii	mgr inż. K. Sołtys	12	P1	laboratoria	aktywne
96ff503f-945e-4ec0-9702-bab358dd0873	Its3	2026-03-24	12:45:00	90	Nowoczesne magazyny energii	mgr inż. P. Tofilski	13	Lk2	laboratoria	aktywne
a08077b8-fd4b-40cc-8fe7-83b33992b58d	Its3	2026-03-24	14:30:00	90	Sztuka redagowania, dyskusji i prezentacji	prof. K. Kluszczyński	10	S1	laboratoria	aktywne
855c6fdf-d82e-4054-8075-153af853f7fa	Its3	2026-03-24	16:15:00	135	Seminarium dyplomowe	prof. K. Kluszczyński	10	S1	laboratoria	aktywne
7bc65a26-5aa7-4dc2-b18e-531eee2170b2	Its3	2026-03-25	12:45:00	90	Systemy informatyczne w zarządzaniu budynkami inteligentnymi	dr inż. A. Romańska	WA201	P1	laboratoria	aktywne
a7635b4f-b051-4d62-9413-55f290e6b385	Its3	2026-03-25	16:15:00	90	Systemy informatyczne w zarządzaniu budynkami inteligentnymi	dr inż. A. Romańska	WA201	P2	laboratoria	aktywne
ccef62b4-e7e4-43b1-9d35-c781f9a690a6	Its3	2026-03-26	16:15:00	90	Systemy informatyczne w zarządzaniu budynkami inteligentnymi	dr inż. A. Romańska	9	W	wykład	aktywne
3784e0ec-3438-4b64-9e0d-c28b9e2afbdb	Its3	2026-03-27	10:00:00	135	Systemy SCADA w zarządzaniu procesami przemysłowymi	prof. R. Sałat	WA2	L1	laboratoria	aktywne
a32e2eba-b6ab-4150-8da3-f1b8b2c1dd09	Its3	2026-03-27	12:30:00	135	Systemy SCADA w zarządzaniu procesami przemysłowymi	prof. R. Sałat	WA2	L2	laboratoria	aktywne
4fd281eb-5e63-4e41-b23b-d6c2ac608158	Its3	2026-03-27	15:00:00	135	Systemy SCADA w zarządzaniu procesami przemysłowymi	prof. R. Sałat	WA2	L3	laboratoria	aktywne
c7411f11-3787-437a-84a8-782accc74da5	Its3	2026-03-31	11:00:00	90	Nowoczesne magazyny energii	mgr inż. P. Tofilski	13	Lk1	laboratoria	aktywne
2492c662-eb3e-4f77-9de4-3d661d6a5234	Its3	2026-03-31	12:45:00	90	Nowoczesne magazyny energii	mgr inż. P. Tofilski	13	Lk2	laboratoria	aktywne
d80bacf6-3762-45e2-adeb-c19d9c68e675	Its3	2026-03-31	14:30:00	90	Sztuka redagowania, dyskusji i prezentacji	prof. K. Kluszczyński	10	S1	laboratoria	aktywne
aa1fdee6-0752-4b63-b212-671ab4d4440d	Its3	2026-03-31	16:15:00	135	Seminarium dyplomowe	prof. K. Kluszczyński	10	S1	laboratoria	aktywne
aff92753-f9c1-40e3-9aef-c72cfcd45e7d	Its3	2026-04-01	07:00:00	900	Przerwa świąteczna	Brak	-	Wszystkie grupy	święto	wolne
a9426f29-a927-4c0d-879b-f53c00db86c6	Its3	2026-04-02	07:00:00	900	Przerwa świąteczna	Brak	-	Wszystkie grupy	święto	wolne
5da4d1ce-4803-4a22-8b8c-066479fbe9a7	Its3	2026-04-03	07:00:00	900	Przerwa świąteczna	Brak	-	Wszystkie grupy	święto	wolne
e07e12f7-1fbc-4c1e-95f2-5cce1134bdad	Its3	2026-04-05	07:00:00	900	Przerwa świąteczna	Brak	-	Wszystkie grupy	święto	wolne
ad51a187-7bfb-4c67-92f4-b45873ceeb72	Its3	2026-04-06	07:00:00	900	Przerwa świąteczna	Brak	-	Wszystkie grupy	święto	wolne
2a5f5c8e-607f-4ef3-b97a-c87a689298ca	Its3	2026-04-07	07:00:00	900	Przerwa świąteczna	Brak	-	Wszystkie grupy	święto	wolne
55e79e97-4efe-4ffc-8089-c43784a94080	Its3	2026-04-08	12:45:00	90	Systemy informatyczne w zarządzaniu budynkami inteligentnymi	dr inż. A. Romańska	WA201	P1	laboratoria	aktywne
780ce9c4-4c07-4a63-8478-262ac011eb96	Its3	2026-04-08	16:15:00	90	Systemy informatyczne w zarządzaniu budynkami inteligentnymi	dr inż. A. Romańska	WA201	P2	laboratoria	aktywne
b73b4e38-0c6f-437b-aeb2-2115b8b6d2b5	Its3	2026-04-09	16:15:00	90	Systemy informatyczne w zarządzaniu budynkami inteligentnymi	dr inż. A. Romańska	9	W	wykład	aktywne
a85e95a0-9931-4860-a33f-a67b6ab077cc	Its3	2026-04-10	10:00:00	135	Systemy SCADA w zarządzaniu procesami przemysłowymi	prof. R. Sałat	WA2	L1	laboratoria	aktywne
d62201eb-a0b1-4b6f-82a6-88f1eec047e4	Its3	2026-04-10	12:30:00	135	Systemy SCADA w zarządzaniu procesami przemysłowymi	prof. R. Sałat	WA2	L2	laboratoria	aktywne
24e927e8-0dad-4979-86dd-d1df53eed244	Its3	2026-04-10	15:00:00	135	Systemy SCADA w zarządzaniu procesami przemysłowymi	prof. R. Sałat	WA2	L3	laboratoria	aktywne
585e8c8c-4b59-4cb4-911e-6956eded3eda	Its3	2026-04-14	11:00:00	90	Nowoczesne magazyny energii	mgr inż. P. Tofilski	13	Lk1	laboratoria	aktywne
8bad8421-9caa-483a-8bf5-b179c0e1d44a	Its3	2026-04-14	12:45:00	90	Nowoczesne magazyny energii	mgr inż. P. Tofilski	13	Lk2	laboratoria	aktywne
c5455ba8-6a46-4bc8-9c94-8fc9a0549def	Its3	2026-04-14	14:30:00	90	Sztuka redagowania, dyskusji i prezentacji	prof. K. Kluszczyński	10	S1	laboratoria	aktywne
0c017656-dad3-44e6-b814-df84ac0bd1a7	Its3	2026-04-14	16:15:00	135	Seminarium dyplomowe	prof. K. Kluszczyński	10	S1	laboratoria	aktywne
6d63afb8-9c08-402c-b58f-903af97da459	Its3	2026-04-15	12:45:00	90	Systemy informatyczne w zarządzaniu budynkami inteligentnymi	dr inż. A. Romańska	WA201	P1	laboratoria	aktywne
0477213c-aad4-4148-a3d0-ccb7a772d77a	Its3	2026-04-15	16:15:00	90	Systemy informatyczne w zarządzaniu budynkami inteligentnymi	dr inż. A. Romańska	WA201	P2	laboratoria	aktywne
1e13e0db-d50e-4e15-a41d-0167d8f4f1b7	Its3	2026-04-16	16:15:00	90	Systemy informatyczne w zarządzaniu budynkami inteligentnymi	dr inż. A. Romańska	9	W	wykład	aktywne
960562e5-73c3-4b66-8a83-80d24abfae24	Its3	2026-04-16	18:00:00	135	Systemy SCADA w zarządzaniu procesami przemysłowymi	prof. R. Sałat	WA2	W	wykład	aktywne
2ee6c520-d38f-4877-a6c8-66b17e4a4c7a	Its3	2026-04-17	10:00:00	135	Systemy SCADA w zarządzaniu procesami przemysłowymi	prof. R. Sałat	WA2	L1	laboratoria	aktywne
862b0c73-4dee-4088-bc99-c976f0074d36	Its3	2026-04-17	12:30:00	135	Systemy SCADA w zarządzaniu procesami przemysłowymi	prof. R. Sałat	WA2	L2	laboratoria	aktywne
652eaf34-91d0-4202-9581-d2ea92e8300b	Its3	2026-04-17	15:00:00	135	Systemy SCADA w zarządzaniu procesami przemysłowymi	prof. R. Sałat	WA2	L3	laboratoria	aktywne
2fd8d07d-ccce-4e62-bf77-4e2bb4e11f46	Its3	2026-04-21	11:00:00	90	Nowoczesne magazyny energii	mgr inż. P. Tofilski	13	Lk1	laboratoria	aktywne
6a60d355-7f17-41aa-8f91-dede29eb3be7	Its3	2026-04-21	12:45:00	90	Nowoczesne magazyny energii	mgr inż. P. Tofilski	13	Lk2	laboratoria	aktywne
31bf8b9f-5759-4a57-bfe1-d1068c6fce55	Its3	2026-04-21	14:30:00	90	Sztuka redagowania, dyskusji i prezentacji	prof. K. Kluszczyński	10	S1	laboratoria	aktywne
8fd1179b-8871-4b39-83d9-8b547d6c75f0	Its3	2026-04-21	16:15:00	135	Seminarium dyplomowe	prof. K. Kluszczyński	10	S1	laboratoria	aktywne
ed597e0c-b27f-4b8e-9b86-cd4d80af6f89	Its3	2026-04-22	12:45:00	90	Systemy informatyczne w zarządzaniu budynkami inteligentnymi	dr inż. A. Romańska	WA201	P1	laboratoria	aktywne
06342f2f-1d2c-4d35-8ddb-be9a0e1c00be	Its3	2026-04-22	16:15:00	90	Systemy informatyczne w zarządzaniu budynkami inteligentnymi	dr inż. A. Romańska	WA201	P2	laboratoria	aktywne
d9c052f2-f8c8-4fb8-ba23-afd5f7e5e08a	Its3	2026-04-23	16:15:00	90	Systemy informatyczne w zarządzaniu budynkami inteligentnymi	dr inż. A. Romańska	9	W	wykład	aktywne
7565a795-9b29-4a6c-8317-bf0c95f312af	Its3	2026-04-24	10:00:00	135	Systemy SCADA w zarządzaniu procesami przemysłowymi	prof. R. Sałat	WA2	L1	laboratoria	aktywne
81738eb1-f50a-48a8-ba99-c6c4c5159136	Its3	2026-04-24	12:30:00	135	Systemy SCADA w zarządzaniu procesami przemysłowymi	prof. R. Sałat	WA2	L2	laboratoria	aktywne
31349956-15a5-4779-80e6-a18a41076b94	Its3	2026-04-24	15:00:00	135	Systemy SCADA w zarządzaniu procesami przemysłowymi	prof. R. Sałat	WA2	L3	laboratoria	aktywne
a84ca9b7-02ae-4aa8-bd54-7f1bc7c1e70d	Its3	2026-04-28	14:30:00	135	Seminarium dyplomowe	prof. K. Kluszczyński	10	S1	laboratoria	aktywne
9b6f2da8-1216-482e-a9cb-ef4753d705c8	Its3	2026-04-30	18:00:00	135	Systemy SCADA w zarządzaniu procesami przemysłowymi	prof. R. Sałat	WA2	W	wykład	aktywne
1c4483ac-026a-443f-8884-ac73141b47cc	Its3	2026-05-01	07:00:00	900	Majówka	Brak	-	Wszystkie grupy	święto	wolne
1fbce6bd-7da4-4366-846c-c403fc947ab6	Its3	2026-05-02	07:00:00	900	Majówka	Brak	-	Wszystkie grupy	święto	wolne
d5394a83-a6dd-411a-a00f-2fe690736c31	Its3	2026-05-03	07:00:00	900	Majówka	Brak	-	Wszystkie grupy	święto	wolne
e64f9895-4c80-47d2-b977-bdeccb52a4a3	Its3	2026-05-04	07:00:00	900	Majówka	Brak	-	Wszystkie grupy	święto	wolne
25f6fcfe-8d5d-482c-99bb-99323031cd4d	Its3	2026-05-05	14:30:00	135	Seminarium dyplomowe	prof. K. Kluszczyński	10	S1	laboratoria	aktywne
fe49546e-e5df-49ee-b972-7c652f076b99	Its3	2026-05-08	10:00:00	135	Systemy SCADA w zarządzaniu procesami przemysłowymi	prof. R. Sałat	WA2	L1	laboratoria	aktywne
51d72db9-677c-4ae2-964d-66539ecdd7b0	Its3	2026-05-08	12:30:00	135	Systemy SCADA w zarządzaniu procesami przemysłowymi	prof. R. Sałat	WA2	L2	laboratoria	aktywne
ab18eccc-32a5-4404-b70d-2a177e510e46	Its3	2026-05-08	15:00:00	135	Systemy SCADA w zarządzaniu procesami przemysłowymi	prof. R. Sałat	WA2	L3	laboratoria	aktywne
23cd937a-ae59-4916-85ee-a5a4571eb101	Its3	2026-05-12	07:00:00	900	Święto Szkoły	Brak	-	Wszystkie grupy	święto	wolne
cdceff4c-0fa1-40f3-b8bc-5459f9063895	Its3	2026-05-14	18:00:00	135	Systemy SCADA w zarządzaniu procesami przemysłowymi	prof. R. Sałat	WA2	W	wykład	aktywne
f23a8f10-fbff-47de-9804-6913526968ec	Its3	2026-05-15	10:00:00	135	Systemy SCADA w zarządzaniu procesami przemysłowymi	prof. R. Sałat	WA2	L1	laboratoria	aktywne
1063c173-0115-4bd5-8fa8-72fc0d94825c	Its3	2026-05-15	12:30:00	135	Systemy SCADA w zarządzaniu procesami przemysłowymi	prof. R. Sałat	WA2	L2	laboratoria	aktywne
edf03a22-1a0a-4ebc-997d-93513211ac32	Its3	2026-05-15	15:00:00	135	Systemy SCADA w zarządzaniu procesami przemysłowymi	prof. R. Sałat	WA2	L3	laboratoria	aktywne
914fc526-23c8-48fe-820f-52bb617b3a6e	Its3	2026-05-24	07:00:00	900	Zielone Świątki	Brak	-	Wszystkie grupy	święto	wolne
82c0f5be-c6ea-4c49-9d0f-7b653c459978	Its3	2026-05-26	16:00:00	135	Seminarium dyplomowe	prof. K. Kluszczyński	10	S1	laboratoria	aktywne
9943cef0-f563-41fa-b0a9-966167a37b3c	Its3	2026-06-04	07:00:00	900	Boże Ciało	Brak	-	Wszystkie grupy	święto	wolne
ee5df114-1e57-4baa-9055-9f05dd2dbf3c	Its3	2026-06-05	07:00:00	900	Boże Ciało	Brak	-	Wszystkie grupy	święto	wolne
5b92aa03-7d20-4aa4-b747-a552028fd21e	IwIKs2	2025-05-07	15:00:00	135	Metody programowania	mgr inż. G. Nowakowski	202	P4	laboratoria	aktywne
41a619dc-fb69-4671-b053-8066d43c66ce	IwIKs2	2026-02-23	11:00:00	90	Elektrotechnika	prof. A. Szromba	A3	W	wykład	aktywne
8aaaf896-f985-443b-8193-94c054d9ba98	IwIKs2	2026-02-23	12:45:00	90	Programowanie w języku VHDL	dr inż. M. Węgrzyn	A3	W	wykład	aktywne
e2c7713b-47a0-42f4-b7af-122f9c29e327	IwIKs2	2026-02-23	18:00:00	90	Podstawy elektroniki	dr inż. A. Drwal	A3	W	wykład	aktywne
638aba61-50b1-4ff7-aa8f-a952702744e3	IwIKs2	2026-02-24	07:30:00	90	Podstawy elektroniki	dr inż. A. Drwal	06	L5	laboratoria	aktywne
78d0b937-04fb-4cdc-841c-6d2b1b60beb7	IwIKs2	2026-02-24	09:15:00	90	Podstawy elektroniki	dr inż. A. Drwal	06	L6	laboratoria	aktywne
35405277-1e14-47bd-b2d5-64b841ab5765	IwIKs2	2026-02-24	11:00:00	90	Elektrotechnika	dr inż. K. Hawron	04	L2	laboratoria	aktywne
6b2b8830-9eb2-405d-96a8-2624f5bde0b3	IwIKs2	2026-02-24	12:45:00	90	Podstawy elektroniki	dr inż. S. Żaba	06	L1	laboratoria	aktywne
de983434-8a9a-4d7b-be7d-c2ca1100f03a	IwIKs2	2026-02-24	12:45:00	90	Elektrotechnika	dr inż. K. Hawron	04	L3	laboratoria	aktywne
5c0e2ccf-e4bf-4ba9-a18d-fb24fbe80b08	IwIKs2	2026-02-24	14:30:00	90	Podstawy elektroniki	dr inż. S. Żaba	06	L2	laboratoria	aktywne
1f0bb072-201f-46ca-ad45-7e25efd3cf75	IwIKs2	2026-02-24	14:30:00	90	Metody obliczeniowe	mgr inż. K. Hatłas	13	Lk4	laboratoria	aktywne
b92b257b-0e4b-4cc3-be97-8296a76385f4	IwIKs2	2026-02-24	14:30:00	90	Elektrotechnika	dr inż. K. Hawron	04	L1	laboratoria	aktywne
aabaa5e0-a38e-4fd7-85ac-2a2a24241bc3	IwIKs2	2026-02-24	16:15:00	90	Podstawy elektroniki	dr inż. S. Żaba	06	L3	laboratoria	aktywne
717d85ca-9694-4fbc-bec7-35080417c24f	IwIKs2	2026-02-24	18:00:00	90	Podstawy elektroniki	dr inż. S. Żaba	06	L4	laboratoria	aktywne
c61e16a2-0958-456c-9ef4-17b25fe8af59	IwIKs2	2026-02-25	07:30:00	180	Wychowanie fizyczne	CSiR	H/C	C	laboratoria	aktywne
863aa266-ebf9-4246-b642-930b6883d91d	IwIKs2	2026-02-25	11:00:00	90	Nauka, technika i społeczeństwo	prof. K. Węc	A4	S1	laboratoria	aktywne
87594c3b-9209-4c07-922a-13bde95b82b7	IwIKs2	2026-02-25	12:45:00	90	Metody programowania	prof. Z. Kokosiński	A1	W	wykład	aktywne
a72d095f-8c23-48cf-85a9-921918b363cd	IwIKs2	2026-02-25	14:30:00	90	Metody obliczeniowe	dr inż. A. Romańska / dr inż. M. Dudzik	A1	W	wykład	aktywne
e25ed096-a931-493e-8e7b-b10c583144cc	IwIKs2	2026-02-26	07:30:00	90	Język angielski	mgr A. Gunia-Tracz	10	Lek3	laboratoria	aktywne
58743d08-f0dc-4282-8667-48c653c4f009	IwIKs2	2026-02-26	09:15:00	90	Język angielski	mgr A. Gunia-Tracz	10	Lek1	laboratoria	aktywne
e876f36b-486e-44d0-8d2f-7846ff99d442	IwIKs2	2026-02-26	09:15:00	90	Elektrotechnika	dr inż. B. Woszczyna	04	L6	laboratoria	aktywne
5fd03470-80bf-4d67-8c25-1763bbc98241	IwIKs2	2026-02-26	09:15:00	90	Metody obliczeniowe	mgr inż. J. Progorowicz	12	Lk3	laboratoria	aktywne
9b5ff6de-f535-4929-9a50-c30dbb44612e	IwIKs2	2026-02-26	11:00:00	90	Język angielski	mgr A. Gunia-Tracz	10	Lek2	laboratoria	aktywne
f6280e60-40be-44d8-97ce-ad96fa51bc5b	IwIKs2	2026-02-26	11:00:00	90	Elektrotechnika	dr inż. B. Woszczyna	04	L5	laboratoria	aktywne
d7ad5311-5fcf-4eab-883c-3d944eaab4df	IwIKs2	2026-02-26	11:00:00	90	Metody obliczeniowe	mgr inż. J. Progorowicz	12	Lk1	laboratoria	aktywne
2aa5b8b1-aaa6-4c3f-9ae5-110746507381	IwIKs2	2026-02-26	12:45:00	90	Elektrotechnika	dr inż. B. Woszczyna	04	L4	laboratoria	aktywne
2039162f-bbb6-4566-931f-ede90ec837e1	IwIKs2	2026-02-26	12:45:00	90	Programowanie w języku VHDL	dr inż. M. Węgrzyn	201	Lk3	laboratoria	aktywne
67735d25-7121-4941-ad2d-f0d50c2b959e	IwIKs2	2026-02-26	12:45:00	90	Metody obliczeniowe	mgr inż. J. Progorowicz	12	Lk2	laboratoria	aktywne
b441a365-4d33-458e-887c-aaecfc27abed	IwIKs2	2026-02-26	14:30:00	90	Elektrotechnika	dr inż. B. Woszczyna	A1	Ć1	laboratoria	aktywne
5e568e86-c078-4268-bfc3-0d52afe3cf28	IwIKs2	2026-02-26	14:30:00	90	Programowanie w języku VHDL	dr inż. M. Węgrzyn	201	Lk4	laboratoria	aktywne
067fb485-4b34-4a7d-8872-c953fbaf8053	IwIKs2	2026-02-27	07:30:00	180	Matematyka dyskretna	dr G. Gancarzewicz	A1	W	wykład	aktywne
c507cb8f-4bad-407d-99c5-47f9fd1174f8	IwIKs2	2026-02-27	11:00:00	90	Programowanie w języku VHDL	dr inż. D. Dorota	208G	Lk1	laboratoria	aktywne
abb5352e-a430-4b32-b96b-d759ee7eb7d3	IwIKs2	2026-02-27	11:00:00	90	Matematyka dyskretna	dr G. Gancarzewicz	A1	Ć2	laboratoria	aktywne
869334ea-20d2-4e7d-a69f-9495e1ba85e3	IwIKs2	2026-02-27	12:45:00	90	Programowanie w języku VHDL	dr inż. D. Dorota	208G	Lk2	laboratoria	aktywne
3584839c-fdde-412d-8b60-7f1342da4668	IwIKs2	2026-02-27	14:30:00	90	Matematyka dyskretna	dr G. Gancarzewicz	A1	Ć1	laboratoria	aktywne
c556e007-2c32-4458-b1e3-35b459377f22	IwIKs2	2026-03-02	11:00:00	90	Elektrotechnika	prof. A. Szromba	A3	W	wykład	aktywne
9f3c1b10-90fa-436c-84a6-7d2431d3c586	IwIKs2	2026-03-02	12:45:00	90	Programowanie w języku VHDL	dr inż. M. Węgrzyn	A3	W	wykład	aktywne
c75086ba-8606-438a-89ad-5589c7165d64	IwIKs2	2026-03-02	18:00:00	90	Podstawy elektroniki	dr inż. S. Żaba	A3	W	wykład	aktywne
f12c3aee-f455-4bdd-a494-f77567c999d2	IwIKs2	2026-03-03	07:30:00	90	Metody programowania	mgr inż. G. Nowakowski	202	Lk1	laboratoria	aktywne
70aec9cb-85db-4656-8d9e-737e14ee7aa7	IwIKs2	2026-03-03	07:30:00	90	Podstawy elektroniki	dr inż. A. Drwal	06	L5	laboratoria	aktywne
12a77812-084a-4fb9-b900-5930294184af	IwIKs2	2026-03-03	09:15:00	90	Metody programowania	mgr inż. G. Nowakowski	202	Lk2	laboratoria	aktywne
d4fb7b25-1e14-49b3-9163-d0b1a43da6af	IwIKs2	2026-03-03	09:15:00	90	Podstawy elektroniki	dr inż. A. Drwal	06	L6	laboratoria	aktywne
11055074-51a8-464c-a9b8-9ae2b451be4b	IwIKs2	2026-03-03	11:00:00	90	Metody programowania	mgr inż. G. Nowakowski	202	Lk3	laboratoria	aktywne
2a5c4e63-1632-4163-af88-ad4aa045af68	IwIKs2	2026-03-03	11:00:00	90	Elektrotechnika	dr inż. K. Hawron	04	L2	laboratoria	aktywne
66285de8-4826-48e1-a47e-b896b7b4a5b4	IwIKs2	2026-03-03	12:45:00	90	Metody programowania	mgr inż. G. Nowakowski	202	Lk4	laboratoria	aktywne
8e15838a-8113-4b6f-8479-ccd085f36561	IwIKs2	2026-03-03	12:45:00	90	Podstawy elektroniki	dr inż. S. Żaba	06	L1	laboratoria	aktywne
88a0acb2-16ac-4372-99f1-e3a6a179e325	IwIKs2	2026-03-03	12:45:00	90	Elektrotechnika	dr inż. K. Hawron	04	L3	laboratoria	aktywne
93b95234-1c74-4ea4-a5cf-a63048f4545f	IwIKs2	2026-03-03	14:30:00	90	Podstawy elektroniki	dr inż. S. Żaba	06	L2	laboratoria	aktywne
63ac950e-7a38-4709-b925-b244dcf0defa	IwIKs2	2026-03-03	14:30:00	90	Metody obliczeniowe	mgr inż. K. Hatłas	13	Lk4	laboratoria	aktywne
bf19fd1f-e479-4c04-8952-2d2a328f8768	IwIKs2	2026-03-03	14:30:00	90	Elektrotechnika	dr inż. K. Hawron	04	L1	laboratoria	aktywne
fe5fdb4e-7a4d-4ec6-856a-d7b9426abeb1	IwIKs2	2026-03-03	16:15:00	90	Podstawy elektroniki	dr inż. S. Żaba	06	L3	laboratoria	aktywne
be955e1b-b380-4422-ad44-1cbc5d016dfc	IwIKs2	2026-03-03	18:00:00	90	Podstawy elektroniki	dr inż. S. Żaba	06	L4	laboratoria	aktywne
0b2d7e49-a8c7-4693-87bd-8a8f131b08e1	IwIKs2	2026-03-04	07:30:00	180	Wychowanie fizyczne	CSiR	H/C	C	laboratoria	aktywne
53ae993f-6f48-4e41-aeca-25c2b6c7c065	IwIKs2	2026-03-04	11:00:00	90	Nauka, technika i społeczeństwo	prof. K. Węc	A4	S2	laboratoria	aktywne
ec58edaa-eae4-413e-ad17-90585fa36a03	IwIKs2	2026-03-04	12:45:00	90	Metody programowania	prof. Z. Kokosiński	A1	W	wykład	aktywne
1f3286fa-5d7c-48a1-b8c2-2689f16be2d8	IwIKs2	2026-03-04	14:30:00	90	Metody obliczeniowe	dr inż. A. Romańska / dr inż. M. Dudzik	A1	W	wykład	aktywne
bca3962c-aeff-4feb-a4ac-0a2c4cc48e79	IwIKs2	2026-03-05	07:30:00	90	Język angielski	mgr A. Gunia-Tracz	10	Lek3	laboratoria	aktywne
72724bcf-ddd8-4282-b6e3-b2e96447cd36	IwIKs2	2026-03-05	09:15:00	90	Język angielski	mgr A. Gunia-Tracz	10	Lek1	laboratoria	aktywne
1d5b235e-5938-4ae2-be62-ed60a45f4a1c	IwIKs2	2026-03-05	09:15:00	90	Elektrotechnika	dr inż. B. Woszczyna	04	L6	laboratoria	aktywne
d2cf9df6-0498-4bb4-941c-c4d1cce90bc7	IwIKs2	2026-03-05	09:15:00	90	Metody obliczeniowe	mgr inż. J. Progorowicz	12	Lk3	laboratoria	aktywne
10e8096d-0370-4483-83c0-722b429cb0fa	IwIKs2	2026-03-05	11:00:00	90	Język angielski	mgr A. Gunia-Tracz	10	Lek2	laboratoria	aktywne
a5e13c05-6021-4ef1-aced-738e131e4e45	IwIKs2	2026-03-05	11:00:00	90	Elektrotechnika	dr inż. B. Woszczyna	04	L5	laboratoria	aktywne
addb6728-aebc-46c3-84ac-01e28b1a4ecf	IwIKs2	2026-03-05	11:00:00	90	Metody obliczeniowe	mgr inż. J. Progorowicz	12	Lk1	laboratoria	aktywne
e0f5f78b-94fb-48a1-a201-9c66ba46437a	IwIKs2	2026-03-05	12:45:00	90	Elektrotechnika	dr inż. B. Woszczyna	04	L4	laboratoria	aktywne
aff25344-1eec-4c5d-851d-3394662cc819	IwIKs2	2026-03-05	12:45:00	90	Programowanie w języku VHDL	dr inż. M. Węgrzyn	201	Lk3	laboratoria	aktywne
86449f73-2c76-4af6-bf9e-46520d916df4	IwIKs2	2026-03-05	12:45:00	90	Metody obliczeniowe	mgr inż. J. Progorowicz	12	Lk2	laboratoria	aktywne
719a923a-dc4c-4846-8b76-744f6ddafbe6	IwIKs2	2026-03-05	14:30:00	90	Programowanie w języku VHDL	dr inż. M. Węgrzyn	201	Lk4	laboratoria	aktywne
36bdb50d-0f4d-447f-bb2c-5c8513782a74	IwIKs2	2026-03-05	16:15:00	90	Elektrotechnika	dr inż. B. Woszczyna	A4	Ć2	laboratoria	aktywne
932722d8-4235-44e9-88d3-c5e4ec21c097	IwIKs2	2026-03-06	07:30:00	90	Matematyka dyskretna	dr G. Gancarzewicz	A1	W	wykład	aktywne
9b2413f4-6373-4265-8bc9-aa238940bf48	IwIKs2	2026-03-06	09:15:00	135	Matematyka dyskretna	dr G. Gancarzewicz	A1	Ć1	laboratoria	aktywne
a7402001-cb1d-4a95-a383-49ea67f260ed	IwIKs2	2026-03-06	11:45:00	135	Programowanie w języku VHDL	dr inż. D. Dorota	208G	Lk1	laboratoria	aktywne
acbbea23-b27f-4283-9f61-5f664fcd2f0b	IwIKs2	2026-03-06	11:45:00	135	Matematyka dyskretna	dr G. Gancarzewicz	A1	Ć2	laboratoria	aktywne
52af3311-26a2-4ef2-8d6e-147670d86672	IwIKs2	2026-03-06	14:15:00	135	Programowanie w języku VHDL	dr inż. D. Dorota	208G	Lk2	laboratoria	aktywne
8cf6f7e4-4921-473f-8990-a436299ba582	IwIKs2	2026-03-09	11:00:00	90	Elektrotechnika	prof. A. Szromba	A3	W	wykład	aktywne
63574406-6c55-40d0-b881-7a4edea0f878	IwIKs2	2026-03-09	12:45:00	90	Programowanie w języku VHDL	dr inż. M. Węgrzyn	A3	W	wykład	aktywne
2d9cde16-f0c0-4d34-b27d-428a8ae48f2f	IwIKs2	2026-03-09	18:00:00	90	Podstawy elektroniki	dr inż. A. Drwal	A3	W	wykład	aktywne
98a7033c-ffc1-45fb-bfde-02ca66fdd265	IwIKs2	2026-03-10	07:30:00	90	Metody programowania	mgr inż. G. Nowakowski	202	Lk1	laboratoria	aktywne
79d5fb0a-7efa-4446-b6b5-01d86ef26df7	IwIKs2	2026-03-10	07:30:00	90	Podstawy elektroniki	dr inż. A. Drwal	06	L5	laboratoria	aktywne
909b0043-280a-4961-9be3-2b0ccce39290	IwIKs2	2026-03-10	09:15:00	90	Metody programowania	mgr inż. G. Nowakowski	202	Lk2	laboratoria	aktywne
3010eef3-0227-4684-8bcc-3dfafbfc48fe	IwIKs2	2026-03-10	09:15:00	90	Podstawy elektroniki	dr inż. A. Drwal	06	L6	laboratoria	aktywne
58d6491d-0d81-4e6f-85b8-61e2e0b586a9	IwIKs2	2026-03-10	11:00:00	90	Metody programowania	mgr inż. G. Nowakowski	202	Lk3	laboratoria	aktywne
7c0a667b-df61-45e6-8b25-9a00043ff994	IwIKs2	2026-03-10	11:00:00	90	Elektrotechnika	dr inż. K. Hawron	04	L2	laboratoria	aktywne
fc9516fb-7f36-41c0-a5b3-84f0c42b6ee1	IwIKs2	2026-03-10	12:45:00	90	Metody programowania	mgr inż. G. Nowakowski	202	Lk4	laboratoria	aktywne
f739a8df-240d-4a65-9026-b7441426d206	IwIKs2	2026-03-10	12:45:00	90	Podstawy elektroniki	dr inż. S. Żaba	06	L1	laboratoria	aktywne
affc07a4-f963-40c1-97e7-33d51652f4bb	IwIKs2	2026-03-10	12:45:00	90	Elektrotechnika	dr inż. K. Hawron	04	L3	laboratoria	aktywne
8bcbb16d-401b-45f8-a9f0-c841f00f4859	IwIKs2	2026-03-10	14:30:00	90	Podstawy elektroniki	dr inż. S. Żaba	06	L2	laboratoria	aktywne
f55bb2a4-945b-4cf1-9e26-7feea6199d25	IwIKs2	2026-03-10	14:30:00	90	Metody obliczeniowe	mgr inż. K. Hatłas	13	Lk4	laboratoria	aktywne
47766ce0-6016-4b32-a5b8-3400c4826d07	IwIKs2	2026-03-10	14:30:00	90	Elektrotechnika	dr inż. K. Hawron	04	L1	laboratoria	aktywne
84fd9edd-4c3f-4344-a890-7f31cb822ae8	IwIKs2	2026-03-10	16:15:00	90	Podstawy elektroniki	dr inż. S. Żaba	06	L3	laboratoria	aktywne
4d606ada-7ddf-433a-a8dc-74fea15aa0d0	IwIKs2	2026-03-10	18:00:00	90	Podstawy elektroniki	dr inż. S. Żaba	06	L4	laboratoria	aktywne
cef2a9f3-46d5-4b8f-9a9d-aae8c29ca744	IwIKs2	2026-03-11	07:30:00	180	Wychowanie fizyczne	CSiR	H/C	C	laboratoria	aktywne
7036d411-0ebb-434f-8746-656f534dcf25	IwIKs2	2026-03-11	11:00:00	90	Nauka, technika i społeczeństwo	prof. K. Węc	A4	S1	laboratoria	aktywne
19ad09c8-fadd-4846-a7a1-37079c91db01	IwIKs2	2026-03-11	12:45:00	90	Metody programowania	prof. Z. Kokosiński	A1	W	wykład	aktywne
bcd108a5-aeb3-4037-886a-8bd52a4671e1	IwIKs2	2026-03-11	14:30:00	90	Metody obliczeniowe	dr inż. A. Romańska / dr inż. M. Dudzik	A1	W	wykład	aktywne
476751e7-2adc-4209-9850-ad121eece910	IwIKs2	2026-03-12	07:30:00	90	Język angielski	mgr A. Gunia-Tracz	10	Lek3	laboratoria	aktywne
680bf1d1-6073-450f-91c9-e2b7583912ce	IwIKs2	2026-03-12	09:15:00	90	Język angielski	mgr A. Gunia-Tracz	10	Lek1	laboratoria	aktywne
d183ea36-92b9-4332-8865-f515d99eeb36	IwIKs2	2026-03-12	09:15:00	90	Elektrotechnika	dr inż. B. Woszczyna	04	L6	laboratoria	aktywne
32078539-d2c8-4970-a75d-fe474990c08f	IwIKs2	2026-03-12	09:15:00	90	Metody obliczeniowe	mgr inż. J. Progorowicz	12	Lk3	laboratoria	aktywne
8fb45b29-e46e-402e-ad97-86e2a913291c	IwIKs2	2026-03-12	11:00:00	90	Język angielski	mgr A. Gunia-Tracz	10	Lek2	laboratoria	aktywne
53fde895-0ab6-478a-aa75-651de94ee929	IwIKs2	2026-03-12	11:00:00	90	Elektrotechnika	dr inż. B. Woszczyna	04	L5	laboratoria	aktywne
e4c78ee0-bd4a-4790-b097-11537784b59c	IwIKs2	2026-03-12	11:00:00	90	Metody obliczeniowe	mgr inż. J. Progorowicz	12	Lk1	laboratoria	aktywne
96e00e02-ad1b-4531-b8b0-b65af3de53f1	IwIKs2	2026-03-12	12:45:00	90	Elektrotechnika	dr inż. B. Woszczyna	04	L4	laboratoria	aktywne
6fc30303-045f-4092-9eb0-168a82bd91e2	IwIKs2	2026-03-12	12:45:00	90	Programowanie w języku VHDL	dr inż. M. Węgrzyn	201	Lk3	laboratoria	aktywne
8a57263d-79e7-4deb-9048-84da465466ce	IwIKs2	2026-03-12	12:45:00	90	Metody obliczeniowe	mgr inż. J. Progorowicz	12	Lk2	laboratoria	aktywne
d17365cc-8cf0-4326-b94d-3b37df51cd3e	IwIKs2	2026-03-12	14:30:00	90	Elektrotechnika	dr inż. B. Woszczyna	A1	Ć1	laboratoria	aktywne
5de8815f-2184-4b76-9d97-889b7d0bfae3	IwIKs2	2026-03-12	14:30:00	90	Programowanie w języku VHDL	dr inż. M. Węgrzyn	201	Lk4	laboratoria	aktywne
ad910ee5-bedc-434a-bf1f-dd68a94e7464	IwIKs2	2026-03-13	07:30:00	90	Matematyka dyskretna	dr G. Gancarzewicz	A1	W	wykład	aktywne
e7e02b3f-fcec-4c74-8399-68778671a253	IwIKs2	2026-03-13	09:15:00	135	Matematyka dyskretna	dr G. Gancarzewicz	A1	Ć1	laboratoria	aktywne
a5a2f27b-6b77-4afa-990d-ff7a417d4293	IwIKs2	2026-03-13	11:45:00	135	Programowanie w języku VHDL	dr inż. D. Dorota	208G	Lk1	laboratoria	aktywne
c219ca2b-d287-4bc8-8261-cf6bff5f03af	IwIKs2	2026-03-13	11:45:00	135	Matematyka dyskretna	dr G. Gancarzewicz	A1	Ć2	laboratoria	aktywne
33761155-a890-4da7-9ca2-112a76cac7bd	IwIKs2	2026-03-13	14:15:00	135	Programowanie w języku VHDL	dr inż. D. Dorota	208G	Lk2	laboratoria	aktywne
81cf23e4-bbd5-441a-9865-a0011a4b0278	IwIKs2	2026-03-16	11:00:00	90	Elektrotechnika	prof. A. Szromba	A3	W	wykład	aktywne
dc2b1ab3-bff5-4b53-8a8e-bb4b1e778f3f	IwIKs2	2026-03-16	12:45:00	90	Programowanie w języku VHDL	dr inż. M. Węgrzyn	A3	W	wykład	aktywne
787b9747-a3d4-40b6-9034-335f53e8939b	IwIKs2	2026-03-16	18:00:00	90	Podstawy elektroniki	dr inż. S. Żaba	A3	W	wykład	aktywne
5431a42d-ece3-48f7-b0e5-a36de5f24c81	IwIKs2	2026-03-17	07:30:00	90	Metody programowania	mgr inż. G. Nowakowski	202	Lk1	laboratoria	aktywne
5c4809fa-fbfc-4372-b9ca-cf94ef6f72e5	IwIKs2	2026-03-17	07:30:00	90	Podstawy elektroniki	dr inż. A. Drwal	06	L5	laboratoria	aktywne
3b63b6a1-d844-4a70-aa9f-f98a83d52017	IwIKs2	2026-03-17	09:15:00	90	Metody programowania	mgr inż. G. Nowakowski	202	Lk2	laboratoria	aktywne
2026ea3f-61b3-4f2e-a00a-d4510d6718ac	IwIKs2	2026-03-17	09:15:00	90	Podstawy elektroniki	dr inż. A. Drwal	06	L6	laboratoria	aktywne
0e70973c-350e-4e73-a8a7-a0f64993e9f1	IwIKs2	2026-03-17	11:00:00	90	Metody programowania	mgr inż. G. Nowakowski	202	Lk3	laboratoria	aktywne
cab411f7-ae94-4e4b-ba0e-99d00ad9a601	IwIKs2	2026-03-17	11:00:00	90	Elektrotechnika	dr inż. K. Hawron	04	L2	laboratoria	aktywne
b14c37c6-a68a-4d9d-a5a7-11daac5c56d0	IwIKs2	2026-03-17	12:45:00	90	Metody programowania	mgr inż. G. Nowakowski	202	Lk4	laboratoria	aktywne
855c41e4-1e72-4b44-81b2-b7eae8f6034b	IwIKs2	2026-03-17	12:45:00	90	Podstawy elektroniki	dr inż. S. Żaba	06	L1	laboratoria	aktywne
c24b9ea6-0e1f-4b93-bf69-ecdfb7c92544	IwIKs2	2026-03-17	12:45:00	90	Elektrotechnika	dr inż. K. Hawron	04	L3	laboratoria	aktywne
d86e483d-2b7c-4423-abbd-541bc7c33379	IwIKs2	2026-03-17	14:30:00	90	Podstawy elektroniki	dr inż. S. Żaba	06	L2	laboratoria	aktywne
235a855a-6abc-48a0-882d-3f017bb86752	IwIKs2	2026-03-17	14:30:00	90	Metody obliczeniowe	mgr inż. K. Hatłas	13	Lk4	laboratoria	aktywne
0595d214-26d9-47c6-99d6-6225ae854118	IwIKs2	2026-03-17	14:30:00	90	Elektrotechnika	dr inż. K. Hawron	04	L1	laboratoria	aktywne
bb250981-1780-4289-ba13-379c9fa176b8	IwIKs2	2026-03-17	16:15:00	90	Podstawy elektroniki	dr inż. S. Żaba	06	L3	laboratoria	aktywne
e510f40f-bdf1-43cf-9e2d-cf52e8446036	IwIKs2	2026-03-17	18:00:00	90	Podstawy elektroniki	dr inż. S. Żaba	06	L4	laboratoria	aktywne
e3ef99cc-45b7-42d7-bf15-c9ebd5742e16	IwIKs2	2026-03-18	07:30:00	180	Wychowanie fizyczne	CSiR	H/C	C	laboratoria	aktywne
de026482-b42f-41fd-9ce8-db22ce7d56e9	IwIKs2	2026-03-18	11:00:00	90	Nauka, technika i społeczeństwo	prof. K. Węc	A4	S2	laboratoria	aktywne
edc85695-156c-4736-bdcc-2ec5e26a745f	IwIKs2	2026-03-18	12:45:00	90	Metody programowania	prof. Z. Kokosiński	A1	W	wykład	aktywne
c22e7f32-1e39-4aa9-8f74-02381f6906b9	IwIKs2	2026-03-18	14:30:00	90	Metody obliczeniowe	dr inż. A. Romańska / dr inż. M. Dudzik	A1	W	wykład	aktywne
f5eafa4e-799d-44a0-ba0e-6687438f599e	IwIKs2	2026-03-19	07:30:00	90	Język angielski	mgr A. Gunia-Tracz	10	Lek3	laboratoria	aktywne
546f4027-224b-4cbe-aeee-8114812f5f2d	IwIKs2	2026-03-19	09:15:00	90	Język angielski	mgr A. Gunia-Tracz	10	Lek1	laboratoria	aktywne
d416194f-c7d9-4125-92b4-8fef851c5204	IwIKs2	2026-03-19	09:15:00	90	Elektrotechnika	dr inż. B. Woszczyna	04	L6	laboratoria	aktywne
b49abdf5-9291-4e75-a12c-f66056783f58	IwIKs2	2026-03-19	09:15:00	90	Metody obliczeniowe	mgr inż. J. Progorowicz	12	Lk3	laboratoria	aktywne
10d51d1f-6e84-49fb-a210-68c17e8afe06	IwIKs2	2026-03-19	11:00:00	90	Język angielski	mgr A. Gunia-Tracz	10	Lek2	laboratoria	aktywne
6ca8f429-a68c-479d-9ba4-e5cb8422ccd6	IwIKs2	2026-03-19	11:00:00	90	Elektrotechnika	dr inż. B. Woszczyna	04	L5	laboratoria	aktywne
0ed157ec-1d59-41b6-a561-cead6a93e086	IwIKs2	2026-03-19	11:00:00	90	Metody obliczeniowe	mgr inż. J. Progorowicz	12	Lk1	laboratoria	aktywne
6ce1b7c2-a616-4d36-b274-43ffe8dc3b21	IwIKs2	2026-03-19	12:45:00	90	Elektrotechnika	dr inż. B. Woszczyna	04	L4	laboratoria	aktywne
c4ff023f-d084-4c9b-bc1b-a3223892b039	IwIKs2	2026-03-19	12:45:00	90	Programowanie w języku VHDL	dr inż. M. Węgrzyn	201	Lk3	laboratoria	aktywne
c9a9cf1b-fd0a-4ed1-b1c8-2f7e3827ed07	IwIKs2	2026-03-19	12:45:00	90	Metody obliczeniowe	mgr inż. J. Progorowicz	12	Lk2	laboratoria	aktywne
8f316723-6c6c-46a3-9ab0-17e330fc8084	IwIKs2	2026-03-19	14:30:00	90	Programowanie w języku VHDL	dr inż. M. Węgrzyn	201	Lk4	laboratoria	aktywne
d23b80a9-db73-4085-9e70-00cf2e6ec6cf	IwIKs2	2026-03-19	16:30:00	90	Elektrotechnika	dr inż. B. Woszczyna	A4	Ć2	laboratoria	aktywne
1c81478f-ed6d-4da7-909e-f4c3ba8d76bb	IwIKs2	2026-03-20	07:30:00	90	Matematyka dyskretna	dr G. Gancarzewicz	A1	W	wykład	aktywne
fe9bad76-1458-4727-922d-8002f9d8e9c7	IwIKs2	2026-03-20	09:15:00	135	Matematyka dyskretna	dr G. Gancarzewicz	A1	Ć1	laboratoria	aktywne
11f702a1-c75a-4182-a8c5-f65c4611f549	IwIKs2	2026-03-20	11:45:00	135	Programowanie w języku VHDL	dr inż. D. Dorota	208G	Lk1	laboratoria	aktywne
94267094-1945-488f-a1ba-8ae906fa9786	IwIKs2	2026-03-20	11:45:00	135	Matematyka dyskretna	dr G. Gancarzewicz	A1	Ć2	laboratoria	aktywne
3059ace0-883e-4f16-8489-bcee3bcc46c6	IwIKs2	2026-03-20	14:15:00	135	Programowanie w języku VHDL	dr inż. D. Dorota	208G	Lk2	laboratoria	aktywne
76139b65-5536-474e-86af-06483622a1e2	IwIKs2	2026-03-23	11:00:00	90	Elektrotechnika	prof. A. Szromba	A3	W	wykład	aktywne
07dd9972-f3ea-4dac-80de-14cd2c73abd0	IwIKs2	2026-03-23	12:45:00	90	Programowanie w języku VHDL	dr inż. M. Węgrzyn	A3	W	wykład	aktywne
454e7c5c-540a-4799-b9b6-7caae8eb73f6	IwIKs2	2026-03-23	18:00:00	90	Podstawy elektroniki	dr inż. A. Drwal	A3	W	wykład	aktywne
f71a55ab-32e4-4d1c-b6ac-9068b4816d71	IwIKs2	2026-03-24	07:30:00	90	Metody programowania	mgr inż. G. Nowakowski	202	Lk1	laboratoria	aktywne
57a0c811-e1f1-41a6-8eca-57a030c1faa8	IwIKs2	2026-03-24	07:30:00	90	Podstawy elektroniki	dr inż. A. Drwal	06	L5	laboratoria	aktywne
fa641369-d8be-4a67-9990-ba4ce29a3489	IwIKs2	2026-03-24	09:15:00	90	Metody programowania	mgr inż. G. Nowakowski	202	Lk2	laboratoria	aktywne
3299d419-a8d7-4255-8cdc-cf6c8da12a47	IwIKs2	2026-03-24	09:15:00	90	Podstawy elektroniki	dr inż. A. Drwal	06	L6	laboratoria	aktywne
9e50f8a4-f27f-4d86-b117-eb6cdc4f4d57	IwIKs2	2026-03-24	11:00:00	90	Metody programowania	mgr inż. G. Nowakowski	202	Lk3	laboratoria	aktywne
876ef3f6-2b56-4e04-a932-e3eb05d6a816	IwIKs2	2026-03-24	11:00:00	90	Elektrotechnika	dr inż. K. Hawron	04	L2	laboratoria	aktywne
9a8da5af-7702-4310-a1e2-bb8965073101	IwIKs2	2026-03-24	12:45:00	90	Metody programowania	mgr inż. G. Nowakowski	202	Lk4	laboratoria	aktywne
536c13f3-6c95-4a87-8209-5a371d684b15	IwIKs2	2026-03-24	12:45:00	90	Podstawy elektroniki	dr inż. S. Żaba	06	L1	laboratoria	aktywne
519cbc48-3dc3-4e6f-8783-7e56de99eac2	IwIKs2	2026-03-24	12:45:00	90	Elektrotechnika	dr inż. K. Hawron	04	L3	laboratoria	aktywne
cd244980-a537-4bf9-a69d-3d99cd5aadcf	IwIKs2	2026-03-24	14:30:00	90	Podstawy elektroniki	dr inż. S. Żaba	06	L2	laboratoria	aktywne
1011e44d-87ce-48b7-99b5-c837b263eda5	IwIKs2	2026-03-24	14:30:00	90	Metody obliczeniowe	mgr inż. K. Hatłas	13	Lk4	laboratoria	aktywne
7e0b302b-c0c4-4178-8452-433d979c38f2	IwIKs2	2026-03-24	14:30:00	90	Elektrotechnika	dr inż. K. Hawron	04	L1	laboratoria	aktywne
a935cd35-d5ad-4d84-bb34-47c07ae197d9	IwIKs2	2026-03-24	16:15:00	90	Podstawy elektroniki	dr inż. S. Żaba	06	L3	laboratoria	aktywne
196a0196-862b-4de4-a934-7c4ea5ebe209	IwIKs2	2026-03-24	18:00:00	90	Podstawy elektroniki	dr inż. S. Żaba	06	L4	laboratoria	aktywne
55b90e7e-adcf-4c9a-9880-e5bf17062251	IwIKs2	2026-03-25	07:30:00	180	Wychowanie fizyczne	CSiR	H/C	C	laboratoria	aktywne
2e8d42c5-c8a2-46a6-aa51-1a4d958c137f	IwIKs2	2026-03-25	11:00:00	90	Nauka, technika i społeczeństwo	prof. K. Węc	A4	S1	laboratoria	aktywne
be37f409-b711-47ab-abbc-a53bc44e2204	IwIKs2	2026-03-25	12:45:00	90	Metody programowania	prof. Z. Kokosiński	A1	W	wykład	aktywne
bd09a67a-4ae6-44f5-b78b-eba543ae1cc8	IwIKs2	2026-03-25	14:30:00	90	Metody obliczeniowe	dr inż. A. Romańska / dr inż. M. Dudzik	A1	W	wykład	aktywne
8800a619-553b-4b4f-80fd-b9e34e4f0e09	IwIKs2	2026-03-26	07:30:00	90	Język angielski	mgr A. Gunia-Tracz	10	Lek3	laboratoria	aktywne
22848cb7-f520-4745-ba0b-fda154cc8c3f	IwIKs2	2026-03-26	09:15:00	90	Język angielski	mgr A. Gunia-Tracz	10	Lek1	laboratoria	aktywne
bf3c1886-b811-46ae-8dc0-4e5e8ca1b57c	IwIKs2	2026-03-26	09:15:00	90	Elektrotechnika	dr inż. B. Woszczyna	04	L6	laboratoria	aktywne
5bc12f15-a8da-4352-97c5-b30b50768433	IwIKs2	2026-03-26	09:15:00	90	Metody obliczeniowe	mgr inż. J. Progorowicz	12	Lk3	laboratoria	aktywne
36157121-a723-4cc8-ab04-6077a6dbd8f9	IwIKs2	2026-03-26	11:00:00	90	Język angielski	mgr A. Gunia-Tracz	10	Lek2	laboratoria	aktywne
9a8237c1-0ee6-4841-9c53-805088bb367d	IwIKs2	2026-03-26	11:00:00	90	Elektrotechnika	dr inż. B. Woszczyna	04	L5	laboratoria	aktywne
9a6313ed-2df6-427f-89de-4f27d3a163eb	IwIKs2	2026-03-26	11:00:00	90	Metody obliczeniowe	mgr inż. J. Progorowicz	12	Lk1	laboratoria	aktywne
1df75e3f-eb90-4bfd-b385-667bfead52ae	IwIKs2	2026-03-26	12:45:00	90	Elektrotechnika	dr inż. B. Woszczyna	04	L4	laboratoria	aktywne
4d01bb91-243b-4d5d-a94c-f1e166a04668	IwIKs2	2026-03-26	12:45:00	90	Programowanie w języku VHDL	dr inż. M. Węgrzyn	201	Lk3	laboratoria	aktywne
09592716-286d-493d-88cb-9ba68ef23774	IwIKs2	2026-03-26	12:45:00	90	Metody obliczeniowe	mgr inż. J. Progorowicz	12	Lk2	laboratoria	aktywne
e196a1d5-2d08-4d75-a473-9b38716a5168	IwIKs2	2026-03-26	14:30:00	90	Elektrotechnika	dr inż. B. Woszczyna	A1	Ć1	laboratoria	aktywne
e33ab548-6734-4431-b2ba-a6508682fe7a	IwIKs2	2026-03-26	14:30:00	90	Programowanie w języku VHDL	dr inż. M. Węgrzyn	201	Lk4	laboratoria	aktywne
1a206c0f-cd0b-462d-bd81-5b4afed6d8d7	IwIKs2	2026-03-27	07:30:00	90	Matematyka dyskretna	dr G. Gancarzewicz	A1	W	wykład	aktywne
ae9f5487-22ef-469b-9715-b040fa1bb7d6	IwIKs2	2026-03-27	09:15:00	135	Matematyka dyskretna	dr G. Gancarzewicz	A1	Ć1	laboratoria	aktywne
8ad72a1a-7415-4bb9-8b84-6cb6a9bc0127	IwIKs2	2026-03-27	11:45:00	135	Programowanie w języku VHDL	dr inż. D. Dorota	208G	Lk1	laboratoria	aktywne
9fce8f47-4f39-4001-84aa-fa1eed9fc61a	IwIKs2	2026-03-27	11:45:00	135	Matematyka dyskretna	dr G. Gancarzewicz	A1	Ć2	laboratoria	aktywne
7d925d51-64f8-4d51-87dc-d5d5914c0f78	IwIKs2	2026-03-27	14:15:00	135	Programowanie w języku VHDL	dr inż. D. Dorota	208G	Lk2	laboratoria	aktywne
50c95d81-9fe8-4ce2-8b88-f318c8b11ff5	IwIKs2	2026-03-30	11:00:00	90	Elektrotechnika	prof. A. Szromba	A3	W	wykład	aktywne
cc3fdba7-3804-4886-8095-2122bd59975a	IwIKs2	2026-03-30	12:45:00	90	Programowanie w języku VHDL	dr inż. M. Węgrzyn	A3	W	wykład	aktywne
a810353a-6e3e-4b92-9c42-2a69c191e96f	IwIKs2	2026-03-30	18:00:00	90	Podstawy elektroniki	dr inż. S. Żaba	A3	W	wykład	aktywne
a41ca95e-91d9-485d-bf15-1cfd1bebc307	IwIKs2	2026-03-31	07:30:00	90	Metody programowania	mgr inż. G. Nowakowski	202	Lk1	laboratoria	aktywne
ea10b4a1-4373-46d2-bbd4-7bdc7dd0b650	IwIKs2	2026-03-31	07:30:00	90	Podstawy elektroniki	dr inż. A. Drwal	06	L5	laboratoria	aktywne
50acbbcc-aa1a-4ffa-8e1f-b264b1cb61b4	IwIKs2	2026-03-31	09:15:00	90	Metody programowania	mgr inż. G. Nowakowski	202	Lk2	laboratoria	aktywne
5d6cf5d3-9737-4ee1-a559-85975e2d83ab	IwIKs2	2026-03-31	09:15:00	90	Podstawy elektroniki	dr inż. A. Drwal	06	L6	laboratoria	aktywne
f7196a61-1af2-4041-9494-4cc0fc5e1e89	IwIKs2	2026-03-31	11:00:00	90	Metody programowania	mgr inż. G. Nowakowski	202	Lk3	laboratoria	aktywne
a8f76790-9a7c-417b-9578-2fdec2ab8346	IwIKs2	2026-03-31	11:00:00	90	Elektrotechnika	dr inż. K. Hawron	04	L2	laboratoria	aktywne
42aab58f-b262-4391-b4e5-2fdca6463ff8	IwIKs2	2026-03-31	12:45:00	90	Metody programowania	mgr inż. G. Nowakowski	202	Lk4	laboratoria	aktywne
c40c0366-8416-4850-a1ba-df44849da568	IwIKs2	2026-03-31	12:45:00	90	Podstawy elektroniki	dr inż. S. Żaba	06	L1	laboratoria	aktywne
5c9461e8-8f93-4651-ac88-8ce37a3daf48	IwIKs2	2026-03-31	12:45:00	90	Elektrotechnika	dr inż. K. Hawron	04	L3	laboratoria	aktywne
5666cd39-ed8a-4f7f-b8d6-ac3d6d914092	IwIKs2	2026-03-31	14:30:00	90	Podstawy elektroniki	dr inż. S. Żaba	06	L2	laboratoria	aktywne
0e238aee-ecd7-4361-9164-8a337e8b299b	IwIKs2	2026-03-31	14:30:00	90	Metody obliczeniowe	mgr inż. K. Hatłas	13	Lk4	laboratoria	aktywne
011405d5-96f8-464f-b066-0683d64c07f7	IwIKs2	2026-03-31	14:30:00	90	Elektrotechnika	dr inż. K. Hawron	04	L1	laboratoria	aktywne
48c4664d-594c-4161-9d29-d41e30f0ba9a	IwIKs2	2026-03-31	16:15:00	90	Podstawy elektroniki	dr inż. S. Żaba	06	L3	laboratoria	aktywne
81b6c09e-7eb7-43ba-b7e6-a55993bc811b	IwIKs2	2026-03-31	18:00:00	90	Podstawy elektroniki	dr inż. S. Żaba	06	L4	laboratoria	aktywne
17e01921-575d-4e9e-a559-365d6b8839e8	IwIKs2	2026-04-01	07:00:00	900	Przerwa świąteczna	Brak	-	Wszystkie grupy	święto	wolne
6ee4a9f7-d448-4eab-a9b6-24ff8dec5ab0	IwIKs2	2026-04-02	07:00:00	900	Przerwa świąteczna	Brak	-	Wszystkie grupy	święto	wolne
efe1bc39-04a3-451a-a7ec-91908473dacc	IwIKs2	2026-04-03	07:00:00	900	Przerwa świąteczna	Brak	-	Wszystkie grupy	święto	wolne
663ef4c8-25b4-4575-82f6-b777f29444c4	IwIKs2	2026-04-04	07:00:00	900	Przerwa świąteczna	Brak	-	Wszystkie grupy	święto	wolne
fee64a2b-d2ae-43e0-8fce-de94ddd827af	IwIKs2	2026-04-05	07:00:00	900	Przerwa świąteczna	Brak	-	Wszystkie grupy	święto	wolne
678abbe7-1618-475b-b5c4-cf3c0db07acc	IwIKs2	2026-04-06	07:00:00	900	Przerwa świąteczna	Brak	-	Wszystkie grupy	święto	wolne
799e902f-069c-41db-943b-27ae905a8cad	IwIKs2	2026-04-07	07:00:00	900	Przerwa świąteczna	Brak	-	Wszystkie grupy	święto	wolne
5f050061-cd3f-4f6b-8aaf-c9766c0e3f25	IwIKs2	2026-04-08	07:30:00	180	Wychowanie fizyczne	CSiR	H/C	C	laboratoria	aktywne
1603a053-76ba-4dd8-87f9-cff674656f0a	IwIKs2	2026-04-08	11:00:00	90	Nauka, technika i społeczeństwo	prof. K. Węc	A4	S1	laboratoria	aktywne
e32e8cfb-71a7-4940-92c1-79e3df22a820	IwIKs2	2026-04-08	12:45:00	90	Metody programowania	prof. Z. Kokosiński	A1	W	wykład	aktywne
fc91eea7-0905-42ca-847f-ec172f619332	IwIKs2	2026-04-08	14:30:00	90	Metody obliczeniowe	dr inż. A. Romańska / dr inż. M. Dudzik	A1	W	wykład	aktywne
66ee6934-1508-4ec9-94cd-1efc67dde6bb	IwIKs2	2026-04-09	07:30:00	90	Język angielski	mgr A. Gunia-Tracz	10	Lek3	laboratoria	aktywne
983e7035-dbae-4263-8e36-5bb7b8600f3a	IwIKs2	2026-04-09	09:15:00	90	Język angielski	mgr A. Gunia-Tracz	10	Lek1	laboratoria	aktywne
83d31e5e-94c1-4029-ad15-66a823983707	IwIKs2	2026-04-09	09:15:00	90	Elektrotechnika	dr inż. B. Woszczyna	04	L6	laboratoria	aktywne
3e281bd7-a267-40a6-a025-59951fa98dc7	IwIKs2	2026-04-09	09:15:00	90	Metody obliczeniowe	mgr inż. J. Progorowicz	12	Lk3	laboratoria	aktywne
bd44bff0-9ba5-4c4f-857f-5273ae60256e	IwIKs2	2026-04-09	11:00:00	90	Język angielski	mgr A. Gunia-Tracz	10	Lek2	laboratoria	aktywne
232dd165-867c-4ffe-a6fb-20c63ff38a8c	IwIKs2	2026-04-09	11:00:00	90	Elektrotechnika	dr inż. B. Woszczyna	04	L5	laboratoria	aktywne
19080d07-46e8-4f82-a47f-a5736d4c6476	IwIKs2	2026-04-09	11:00:00	90	Metody obliczeniowe	mgr inż. J. Progorowicz	12	Lk1	laboratoria	aktywne
c0eb3014-2e33-498d-ae7f-7141fbafef03	IwIKs2	2026-04-09	12:45:00	90	Elektrotechnika	dr inż. B. Woszczyna	04	L4	laboratoria	aktywne
23aa2c5a-1e4d-4fc9-b26f-7c984e2fe440	IwIKs2	2026-04-09	12:45:00	90	Programowanie w języku VHDL	dr inż. M. Węgrzyn	201	Lk3	laboratoria	aktywne
d50cead6-dcd4-4726-832b-d386d3885b0e	IwIKs2	2026-04-09	12:45:00	90	Metody obliczeniowe	mgr inż. J. Progorowicz	12	Lk2	laboratoria	aktywne
6ce87a83-407d-486f-97c2-72d32e9be27d	IwIKs2	2026-04-09	14:30:00	90	Elektrotechnika	dr inż. B. Woszczyna	A1	Ć1	laboratoria	aktywne
aa051a35-7a71-48e7-af06-bb27164829d6	IwIKs2	2026-04-09	14:30:00	90	Programowanie w języku VHDL	dr inż. M. Węgrzyn	201	Lk4	laboratoria	aktywne
20481e36-6247-40cf-9606-da5432dc4748	IwIKs2	2026-04-09	15:00:00	90	Metody programowania	mgr inż. G. Nowakowski	202	P3	laboratoria	aktywne
289a733e-2fd8-44e9-996e-10de34072003	IwIKs2	2026-04-10	07:30:00	90	Matematyka dyskretna	dr G. Gancarzewicz	A1	W	wykład	aktywne
3403d5ba-d0bd-40b5-aee9-73ba1d04b7a7	IwIKs2	2026-04-10	09:15:00	135	Matematyka dyskretna	dr G. Gancarzewicz	A1	Ć1	laboratoria	aktywne
225a679d-8fa3-42eb-a6ec-7dd17f7d37e1	IwIKs2	2026-04-10	11:30:00	90	Programowanie w języku VHDL	dr inż. D. Dorota	208G	Lk1	laboratoria	aktywne
3d59f722-68c2-4601-aaec-cc6f857b9f79	IwIKs2	2026-04-10	11:45:00	135	Matematyka dyskretna	dr G. Gancarzewicz	A1	Ć2	laboratoria	aktywne
dcae1cc4-7c25-4ea7-a0e4-ae5aae130a4d	IwIKs2	2026-04-10	13:15:00	90	Programowanie w języku VHDL	dr inż. D. Dorota	208G	Lk2	laboratoria	aktywne
df17e195-d636-4b46-97b2-a1f4e7dd99a4	IwIKs2	2026-04-13	11:00:00	90	Elektrotechnika	prof. A. Szromba	A3	W	wykład	aktywne
182c4030-4659-4b0b-8f09-7939e022fc26	IwIKs2	2026-04-13	12:45:00	90	Programowanie w języku VHDL	dr inż. M. Węgrzyn	A3	W	wykład	aktywne
e2646ae8-1fa9-4f85-a27a-bf5692b5fac4	IwIKs2	2026-04-13	18:00:00	90	Podstawy elektroniki	dr inż. S. Żaba	A3	W	wykład	aktywne
660b9169-3553-408d-9a61-fafdc84c7d6f	IwIKs2	2026-04-14	07:30:00	90	Metody programowania	mgr inż. G. Nowakowski	202	Lk1	laboratoria	aktywne
115e53f0-00e7-4fb4-9f44-a001256d6717	IwIKs2	2026-04-14	07:30:00	90	Podstawy elektroniki	dr inż. A. Drwal	06	L5	laboratoria	aktywne
c6f6cc4c-123a-4e7f-9e38-9a26be5c76ef	IwIKs2	2026-04-14	09:15:00	90	Metody programowania	mgr inż. G. Nowakowski	202	Lk2	laboratoria	aktywne
91e5655e-6bdf-4ddb-862a-9ae734a4bd29	IwIKs2	2026-04-14	09:15:00	90	Podstawy elektroniki	dr inż. A. Drwal	06	L6	laboratoria	aktywne
66791054-7704-450a-abb6-c4ab0ab858ae	IwIKs2	2026-04-14	11:00:00	90	Metody programowania	mgr inż. G. Nowakowski	202	Lk3	laboratoria	aktywne
db61c73c-eea8-43e1-b5e6-ba8a2bf6ac0e	IwIKs2	2026-04-14	11:00:00	90	Elektrotechnika	dr inż. K. Hawron	04	L2	laboratoria	aktywne
beffcea7-cb9d-46c6-80b1-4e921534d92e	IwIKs2	2026-04-14	12:45:00	90	Metody programowania	mgr inż. G. Nowakowski	202	Lk4	laboratoria	aktywne
1203993e-ad7a-4b70-b55e-304a1f730fc8	IwIKs2	2026-04-14	12:45:00	90	Podstawy elektroniki	dr inż. S. Żaba	06	L1	laboratoria	aktywne
58201998-4984-4781-8154-897b108fcb4e	IwIKs2	2026-04-14	12:45:00	90	Elektrotechnika	dr inż. K. Hawron	04	L3	laboratoria	aktywne
60a59afb-6e70-4bd8-8108-7d839deb3655	IwIKs2	2026-04-14	14:30:00	90	Podstawy elektroniki	dr inż. S. Żaba	06	L2	laboratoria	aktywne
d8a90644-710d-4c49-b28f-f36c4881887f	IwIKs2	2026-04-14	14:30:00	90	Metody obliczeniowe	mgr inż. K. Hatłas	13	Lk4	laboratoria	aktywne
f0b920da-529f-44eb-9aa6-57b7560c2f80	IwIKs2	2026-04-14	14:30:00	90	Elektrotechnika	dr inż. K. Hawron	04	L1	laboratoria	aktywne
842cc8b5-ddeb-4efd-b6db-90037c2af5e7	IwIKs2	2026-04-14	16:15:00	90	Podstawy elektroniki	dr inż. S. Żaba	06	L3	laboratoria	aktywne
80f3e3c7-a971-4d66-9970-0d0a6a2fb47a	IwIKs2	2026-04-14	18:00:00	90	Podstawy elektroniki	dr inż. S. Żaba	06	L4	laboratoria	aktywne
56aed713-a629-41b2-ae60-6d1848094157	IwIKs2	2026-04-15	07:30:00	180	Wychowanie fizyczne	CSiR	H/C	C	laboratoria	aktywne
1f1112df-6d80-400f-9df0-fb48a3a9764f	IwIKs2	2026-04-15	11:00:00	90	Nauka, technika i społeczeństwo	prof. K. Węc	A4	S2	laboratoria	aktywne
74fc516f-b46c-4676-a166-9f6e5d9eb8a1	IwIKs2	2026-04-15	12:45:00	90	Metody programowania	prof. Z. Kokosiński	A1	W	wykład	aktywne
2361b65f-8647-4a8d-8705-f51e326dbaac	IwIKs2	2026-04-15	14:30:00	90	Metody obliczeniowe	dr inż. A. Romańska / dr inż. M. Dudzik	A1	W	wykład	aktywne
1e5a70b7-0254-4c86-ba9d-3f92026782d0	IwIKs2	2026-04-16	07:30:00	90	Język angielski	mgr A. Gunia-Tracz	10	Lek3	laboratoria	aktywne
1733664d-a436-4e66-941c-ea77997e68a6	IwIKs2	2026-04-16	09:15:00	90	Język angielski	mgr A. Gunia-Tracz	10	Lek1	laboratoria	aktywne
b71fc10f-4f64-48f4-809d-d967d4dd36c2	IwIKs2	2026-04-16	09:15:00	90	Elektrotechnika	dr inż. B. Woszczyna	04	L6	laboratoria	aktywne
e41c66ce-98c7-4e64-82e1-58baab5652ff	IwIKs2	2026-04-16	09:15:00	90	Metody obliczeniowe	mgr inż. J. Progorowicz	12	Lk3	laboratoria	aktywne
26b50914-6f98-4520-88e6-959de4d6f98f	IwIKs2	2026-04-16	11:00:00	90	Język angielski	mgr A. Gunia-Tracz	10	Lek2	laboratoria	aktywne
15e85fbe-d370-4685-9d9b-80384852b787	IwIKs2	2026-04-16	11:00:00	90	Elektrotechnika	dr inż. B. Woszczyna	04	L5	laboratoria	aktywne
ba645b6b-1f0a-484d-ae64-d677c4ed0e08	IwIKs2	2026-04-16	11:00:00	90	Metody obliczeniowe	mgr inż. J. Progorowicz	12	Lk1	laboratoria	aktywne
6543477b-68dc-4405-ad35-34492b25b878	IwIKs2	2026-04-16	12:45:00	90	Elektrotechnika	dr inż. B. Woszczyna	04	L4	laboratoria	aktywne
a9942a18-943e-42c0-b7a9-4267019d8d69	IwIKs2	2026-04-16	12:45:00	90	Programowanie w języku VHDL	dr inż. M. Węgrzyn	201	Lk3	laboratoria	aktywne
e7c299e0-b4e9-4797-84ac-4eaf125273d5	IwIKs2	2026-04-16	12:45:00	90	Metody obliczeniowe	mgr inż. J. Progorowicz	12	Lk2	laboratoria	aktywne
faf1cfa0-2c9a-433c-ba76-6cb288c4d3b3	IwIKs2	2026-04-16	14:30:00	90	Programowanie w języku VHDL	dr inż. M. Węgrzyn	201	Lk4	laboratoria	aktywne
5f211b21-03b6-4fbe-ac4c-6ec5ab033227	IwIKs2	2026-04-16	15:00:00	90	Metody programowania	mgr inż. G. Nowakowski	202	P1	laboratoria	aktywne
9060675b-34f1-45d7-a2c3-0be5744f6926	IwIKs2	2026-04-16	16:15:00	90	Elektrotechnika	dr inż. B. Woszczyna	A4	Ć2	laboratoria	aktywne
43a01bce-ba3e-49cb-ae6c-c1be63e03f0c	IwIKs2	2026-04-17	07:30:00	90	Matematyka dyskretna	dr G. Gancarzewicz	A1	W	wykład	aktywne
fb06bff5-121f-4cf2-bc7d-d8bcbc88da29	IwIKs2	2026-04-17	09:15:00	135	Matematyka dyskretna	dr G. Gancarzewicz	A1	Ć1	laboratoria	aktywne
78424707-6ffd-462a-83ca-5d628f5addd2	IwIKs2	2026-04-17	11:30:00	90	Programowanie w języku VHDL	dr inż. D. Dorota	208G	Lk1	laboratoria	aktywne
f409ed86-9774-4799-9946-81732d211204	IwIKs2	2026-04-17	11:45:00	135	Matematyka dyskretna	dr G. Gancarzewicz	A1	Ć2	laboratoria	aktywne
0e9ef3bd-b0a4-4f42-99e5-583ee54a7566	IwIKs2	2026-04-17	13:15:00	90	Programowanie w języku VHDL	dr inż. D. Dorota	208G	Lk2	laboratoria	aktywne
9cd2e284-a06c-4e11-8ede-5eea9d5b81ab	IwIKs2	2026-04-20	11:00:00	90	Elektrotechnika	prof. A. Szromba	A3	W	wykład	aktywne
d61be9a6-ed05-4b88-8ea7-2408685a45d0	IwIKs2	2026-04-20	12:45:00	90	Programowanie w języku VHDL	dr inż. M. Węgrzyn	A3	W	wykład	aktywne
7d3d2f38-54b0-4cde-9a85-0810fc9dfc8c	IwIKs2	2026-04-20	18:00:00	90	Podstawy elektroniki	dr inż. A. Drwal	A3	W	wykład	aktywne
2f8fdf6f-b576-49d7-a1b9-9bf4a7fddacb	IwIKs2	2026-04-21	07:30:00	90	Metody programowania	mgr inż. G. Nowakowski	202	Lk1	laboratoria	aktywne
28a68f17-4b91-4dd4-9ce2-9dce25d5f59f	IwIKs2	2026-04-21	07:30:00	90	Podstawy elektroniki	dr inż. A. Drwal	06	L5	laboratoria	aktywne
c24509f1-4d80-475b-804f-223bbed83627	IwIKs2	2026-04-21	09:15:00	90	Metody programowania	mgr inż. G. Nowakowski	202	Lk2	laboratoria	aktywne
9a241b72-2282-47dd-9cb9-22f2d3fbf893	IwIKs2	2026-04-21	09:15:00	90	Podstawy elektroniki	dr inż. A. Drwal	06	L6	laboratoria	aktywne
938acff2-c490-4f96-8ecd-ceca6900d0ff	IwIKs2	2026-04-21	11:00:00	90	Metody programowania	mgr inż. G. Nowakowski	202	Lk3	laboratoria	aktywne
62028bef-2d9a-4655-a04b-477e1da146cf	IwIKs2	2026-04-21	11:00:00	90	Elektrotechnika	dr inż. K. Hawron	04	L2	laboratoria	aktywne
2894a02c-3bd6-46e1-b516-96b538f9272c	IwIKs2	2026-04-21	12:45:00	90	Metody programowania	mgr inż. G. Nowakowski	202	Lk4	laboratoria	aktywne
359661cd-5271-4d7c-a300-1c4842d821a9	IwIKs2	2026-04-21	12:45:00	90	Podstawy elektroniki	dr inż. S. Żaba	06	L1	laboratoria	aktywne
ea4eb2ea-4839-4e08-98ae-9d98c52e9873	IwIKs2	2026-04-21	12:45:00	90	Elektrotechnika	dr inż. K. Hawron	04	L3	laboratoria	aktywne
e7c4b6db-22c1-479c-9174-87d8c6d36f15	IwIKs2	2026-04-21	14:30:00	90	Podstawy elektroniki	dr inż. S. Żaba	06	L2	laboratoria	aktywne
a0524afa-1af0-4791-9637-e8dcf403b1b5	IwIKs2	2026-04-21	14:30:00	90	Metody obliczeniowe	mgr inż. K. Hatłas	13	Lk4	laboratoria	aktywne
f01a1432-e51e-4332-8124-f3533422193c	IwIKs2	2026-04-21	14:30:00	90	Elektrotechnika	dr inż. K. Hawron	04	L1	laboratoria	aktywne
237390af-66af-47c6-aabe-ed7f4bf68de4	IwIKs2	2026-04-21	16:15:00	90	Podstawy elektroniki	dr inż. S. Żaba	06	L3	laboratoria	aktywne
2fbf8660-f1c8-4d85-9052-75b14617e2dd	IwIKs2	2026-04-21	18:00:00	90	Podstawy elektroniki	dr inż. S. Żaba	06	L4	laboratoria	aktywne
b1edccba-c6c8-4dba-884b-64b5ced623ba	IwIKs2	2026-04-22	07:30:00	180	Wychowanie fizyczne	CSiR	H/C	C	laboratoria	aktywne
fc3f2bee-f074-418b-9201-1fb473591569	IwIKs2	2026-04-22	11:00:00	90	Nauka, technika i społeczeństwo	prof. K. Węc	A4	S1	laboratoria	aktywne
85add6a3-d14b-4f60-82f6-8f046d309613	IwIKs2	2026-04-22	12:45:00	90	Metody programowania	prof. Z. Kokosiński	A1	W	wykład	aktywne
5b971aff-7af3-4cab-9181-6435ff8517c2	IwIKs2	2026-04-22	14:30:00	90	Metody obliczeniowe	dr inż. A. Romańska / dr inż. M. Dudzik	A1	W	wykład	aktywne
27b90c22-3cf8-41fa-8913-7e2181711f79	IwIKs2	2026-04-23	07:30:00	90	Język angielski	mgr A. Gunia-Tracz	10	Lek3	laboratoria	aktywne
10615225-b0f1-4719-be73-653c889ebe0d	IwIKs2	2026-04-23	09:15:00	90	Język angielski	mgr A. Gunia-Tracz	10	Lek1	laboratoria	aktywne
1e41e8a3-3924-4c12-b83d-de3478dea837	IwIKs2	2026-04-23	09:15:00	90	Elektrotechnika	dr inż. B. Woszczyna	04	L6	laboratoria	aktywne
499f73b1-9f7f-465e-a8ac-24e3c42a1426	IwIKs2	2026-04-23	09:15:00	90	Metody obliczeniowe	mgr inż. J. Progorowicz	12	Lk3	laboratoria	aktywne
397fc52b-6cfa-451d-b7fc-94b038bc5ec6	IwIKs2	2026-04-23	11:00:00	90	Język angielski	mgr A. Gunia-Tracz	10	Lek2	laboratoria	aktywne
f3f57221-6635-4389-9a1a-58e49b1ea602	IwIKs2	2026-04-23	11:00:00	90	Elektrotechnika	dr inż. B. Woszczyna	04	L5	laboratoria	aktywne
c0057ba0-d777-4007-a03b-cb5b58124c0a	IwIKs2	2026-04-23	11:00:00	90	Metody obliczeniowe	mgr inż. J. Progorowicz	12	Lk1	laboratoria	aktywne
aaa44b28-06a6-41df-84a1-445d9df79ff1	IwIKs2	2026-04-23	12:45:00	90	Elektrotechnika	dr inż. B. Woszczyna	04	L4	laboratoria	aktywne
ce9df8a6-089f-4891-a1e2-1b74b4f28901	IwIKs2	2026-04-23	12:45:00	90	Programowanie w języku VHDL	dr inż. M. Węgrzyn	201	Lk3	laboratoria	aktywne
0c8df0df-4363-4c37-85ef-590f221977f2	IwIKs2	2026-04-23	12:45:00	90	Metody obliczeniowe	mgr inż. J. Progorowicz	12	Lk2	laboratoria	aktywne
abc0a4d9-dcfc-488a-84ae-53e7250c4f12	IwIKs2	2026-04-23	14:30:00	90	Elektrotechnika	dr inż. B. Woszczyna	A1	Ć1	laboratoria	aktywne
88c11d43-d9d8-4374-8186-b3dd0a53b859	IwIKs2	2026-04-23	14:30:00	90	Programowanie w języku VHDL	dr inż. M. Węgrzyn	201	Lk4	laboratoria	aktywne
150e7c59-9f2d-44d6-88cb-e334cd79a10b	IwIKs2	2026-04-23	16:15:00	90	Metody programowania	mgr inż. G. Nowakowski	202	P4	laboratoria	aktywne
21c22fbd-b090-4fec-a758-51a756f6c707	IwIKs2	2026-04-24	07:30:00	90	Matematyka dyskretna	dr G. Gancarzewicz	A1	W	wykład	aktywne
2599f751-ec23-4b1a-bc02-6976004166be	IwIKs2	2026-04-24	09:15:00	135	Matematyka dyskretna	dr G. Gancarzewicz	A1	Ć1	laboratoria	aktywne
317a644c-2c92-462b-8983-3e2ff2e23022	IwIKs2	2026-04-24	11:30:00	90	Programowanie w języku VHDL	dr inż. D. Dorota	208G	Lk1	laboratoria	aktywne
570a43ab-dfb1-4cd7-ac69-0a0fb75ffe3a	IwIKs2	2026-04-24	11:45:00	135	Matematyka dyskretna	dr G. Gancarzewicz	A1	Ć2	laboratoria	aktywne
25e9e65b-62dd-4033-80be-c027851ade53	IwIKs2	2026-04-24	13:15:00	90	Programowanie w języku VHDL	dr inż. D. Dorota	208G	Lk2	laboratoria	aktywne
92ffba9f-57a6-4c35-b41b-31a8389be72e	IwIKs2	2026-04-27	11:00:00	90	Elektrotechnika	prof. A. Szromba	A3	W	wykład	aktywne
92b84568-70aa-4fbf-b733-fcfe8c1a54a6	IwIKs2	2026-04-27	12:45:00	90	Programowanie w języku VHDL	dr inż. M. Węgrzyn	A3	W	wykład	aktywne
356c72f7-7124-43d7-aac5-73258357f076	IwIKs2	2026-04-28	07:30:00	90	Metody programowania	mgr inż. G. Nowakowski	202	Lk1	laboratoria	aktywne
c5e2c15d-071e-44eb-b95a-86aee5663595	IwIKs2	2026-04-28	07:30:00	90	Podstawy elektroniki	dr inż. A. Drwal	06	L5	laboratoria	aktywne
27772a06-6744-4adf-b78f-5d84f0bdcdb4	IwIKs2	2026-04-28	09:15:00	90	Metody programowania	mgr inż. G. Nowakowski	202	Lk2	laboratoria	aktywne
13886a15-b37d-474c-98ec-c7b7be244dc6	IwIKs2	2026-04-28	09:15:00	90	Podstawy elektroniki	dr inż. A. Drwal	06	L6	laboratoria	aktywne
bdb59ac5-90df-4e2f-aa99-1b7e30afc038	IwIKs2	2026-04-28	11:00:00	90	Metody programowania	mgr inż. G. Nowakowski	202	Lk3	laboratoria	aktywne
70e956a9-39a4-4df7-b002-26fc0455a1c8	IwIKs2	2026-04-28	11:00:00	90	Elektrotechnika	dr inż. K. Hawron	04	L2	laboratoria	aktywne
512a38c1-ab68-497d-9d38-afa3fb19e603	IwIKs2	2026-04-28	12:45:00	90	Metody programowania	mgr inż. G. Nowakowski	202	Lk4	laboratoria	aktywne
3c26e6d7-ba0c-4f9e-b3ff-46b9e08b13ed	IwIKs2	2026-04-28	12:45:00	90	Podstawy elektroniki	dr inż. S. Żaba	06	L1	laboratoria	aktywne
bd9c30ff-b0dc-4b52-b1e5-bc1f342d8573	IwIKs2	2026-04-28	12:45:00	90	Elektrotechnika	dr inż. K. Hawron	04	L3	laboratoria	aktywne
996e4aa3-c6db-484d-aaa9-9a3c64c195ff	IwIKs2	2026-04-28	14:30:00	90	Podstawy elektroniki	dr inż. S. Żaba	06	L2	laboratoria	aktywne
ccb55df0-e858-40c8-9514-884bb2d50774	IwIKs2	2026-04-28	14:30:00	90	Metody obliczeniowe	mgr inż. K. Hatłas	13	Lk4	laboratoria	aktywne
7e7932ee-d37a-472d-ba65-0b794b222637	IwIKs2	2026-04-28	14:30:00	90	Elektrotechnika	dr inż. K. Hawron	04	L1	laboratoria	aktywne
2705c316-bf2a-44b3-8012-de0981f0588c	IwIKs2	2026-04-28	16:15:00	90	Podstawy elektroniki	dr inż. S. Żaba	06	L3	laboratoria	aktywne
e3304c84-a412-4218-9212-25014f4ec056	IwIKs2	2026-04-28	18:00:00	90	Podstawy elektroniki	dr inż. S. Żaba	06	L4	laboratoria	aktywne
02c5e1a3-8ec4-408a-be74-57fb591b68d0	IwIKs2	2026-04-29	07:30:00	180	Wychowanie fizyczne	CSiR	H/C	C	laboratoria	aktywne
89f49b3b-f733-4381-913b-c548b37c277c	IwIKs2	2026-04-29	11:00:00	90	Nauka, technika i społeczeństwo	prof. K. Węc	A4	S2	laboratoria	aktywne
c51ce259-01a0-4b28-a196-7817e6d67549	IwIKs2	2026-04-29	12:45:00	90	Metody programowania	prof. Z. Kokosiński	A1	W	wykład	aktywne
d9bf34c5-9ef8-402f-aa9e-c50efced0017	IwIKs2	2026-04-29	14:30:00	90	Metody obliczeniowe	dr inż. A. Romańska / dr inż. M. Dudzik	A1	W	wykład	aktywne
ad50f48b-fb23-462f-bcfc-a14bfccc509e	IwIKs2	2026-04-30	07:30:00	90	Język angielski	mgr A. Gunia-Tracz	10	Lek3	laboratoria	aktywne
2e3e91c4-2561-4a72-b629-7c8e25db3c97	IwIKs2	2026-04-30	09:15:00	90	Język angielski	mgr A. Gunia-Tracz	10	Lek1	laboratoria	aktywne
9d5df3ff-df8c-450e-b14c-c2301d69d5e9	IwIKs2	2026-04-30	09:15:00	90	Elektrotechnika	dr inż. B. Woszczyna	04	L6	laboratoria	aktywne
13626b47-417d-455f-b691-73f3cec90947	IwIKs2	2026-04-30	09:15:00	90	Metody obliczeniowe	mgr inż. J. Progorowicz	12	Lk3	laboratoria	aktywne
bbdec371-6a50-4b70-aaab-a6736ef7c9ff	IwIKs2	2026-04-30	11:00:00	90	Język angielski	mgr A. Gunia-Tracz	10	Lek2	laboratoria	aktywne
695c1101-d14c-41e2-8618-322bd8a38f33	IwIKs2	2026-04-30	11:00:00	90	Elektrotechnika	dr inż. B. Woszczyna	04	L5	laboratoria	aktywne
0939ac4f-af02-4ad1-905e-17b74e97df10	IwIKs2	2026-04-30	11:00:00	90	Metody obliczeniowe	mgr inż. J. Progorowicz	12	Lk1	laboratoria	aktywne
5cc5b1e7-a5c3-4e58-870a-9f7985136282	IwIKs2	2026-04-30	12:45:00	90	Elektrotechnika	dr inż. B. Woszczyna	04	L4	laboratoria	aktywne
e74c60ca-74f8-491d-bc87-44e6fae83491	IwIKs2	2026-04-30	12:45:00	90	Programowanie w języku VHDL	dr inż. M. Węgrzyn	201	Lk3	laboratoria	aktywne
25e15aaf-cd89-45a2-beb2-af72e8ba3f59	IwIKs2	2026-04-30	12:45:00	90	Metody obliczeniowe	mgr inż. J. Progorowicz	12	Lk2	laboratoria	aktywne
385b87e9-5a48-4de6-938c-88334271d130	IwIKs2	2026-04-30	14:30:00	90	Programowanie w języku VHDL	dr inż. M. Węgrzyn	201	Lk4	laboratoria	aktywne
bd8106bb-67d1-4847-948e-a810afe70853	IwIKs2	2026-04-30	15:00:00	90	Metody programowania	mgr inż. G. Nowakowski	202	P2	laboratoria	aktywne
8faa4292-caa8-492d-8c59-a3fe25ff992d	IwIKs2	2026-04-30	16:15:00	90	Elektrotechnika	dr inż. B. Woszczyna	A4	Ć2	laboratoria	aktywne
f3f2f989-a0b5-4e4c-9ba3-5b23acf7b346	IwIKs2	2026-05-01	07:00:00	900	Majówka	Brak	-	Wszystkie grupy	święto	wolne
620fc526-fbd3-4d63-ab8b-d48e260f3d6a	IwIKs2	2026-05-02	07:00:00	900	Majówka	Brak	-	Wszystkie grupy	święto	wolne
417e0bad-9838-494b-a75d-347757c0a15b	IwIKs2	2026-05-03	07:00:00	900	Majówka	Brak	-	Wszystkie grupy	święto	wolne
3375be6c-db15-45c2-a924-0da941919de3	IwIKs2	2026-05-04	07:00:00	900	Majówka	Brak	-	Wszystkie grupy	święto	wolne
14b2699b-e725-4029-96a4-f3b50f7d8a5a	IwIKs2	2026-05-05	07:30:00	90	Metody programowania	mgr inż. G. Nowakowski	202	Lk1	laboratoria	aktywne
92edadf3-df08-489a-b728-b1af4e7f3229	IwIKs2	2026-05-05	07:30:00	90	Podstawy elektroniki	dr inż. A. Drwal	06	L5	laboratoria	aktywne
0743791f-d1c4-4dbc-9d45-395d0846ac99	IwIKs2	2026-05-05	09:15:00	90	Metody programowania	mgr inż. G. Nowakowski	202	Lk2	laboratoria	aktywne
47c38f57-48c3-4b38-9bb9-e17ad9a18696	IwIKs2	2026-05-05	09:15:00	90	Podstawy elektroniki	dr inż. A. Drwal	06	L6	laboratoria	aktywne
ddd700df-e673-443b-9dc3-313c1802421a	IwIKs2	2026-05-05	11:00:00	90	Metody programowania	mgr inż. G. Nowakowski	202	Lk3	laboratoria	aktywne
33e76bb4-20ba-4fe2-9156-099f2f18079b	IwIKs2	2026-05-05	11:00:00	90	Elektrotechnika	dr inż. K. Hawron	04	L2	laboratoria	aktywne
08a73ecd-329d-4063-a35c-3c9d0a2f4e46	IwIKs2	2026-05-05	12:45:00	90	Metody programowania	mgr inż. G. Nowakowski	202	Lk4	laboratoria	aktywne
c558b3f7-bfce-4f73-803f-636cb57417bb	IwIKs2	2026-05-05	12:45:00	90	Podstawy elektroniki	dr inż. S. Żaba	06	L1	laboratoria	aktywne
46f5dd01-9d77-4981-af91-31b79f822168	IwIKs2	2026-05-05	12:45:00	90	Elektrotechnika	dr inż. K. Hawron	04	L3	laboratoria	aktywne
881e17d6-2e9a-474f-8b01-f570122784de	IwIKs2	2026-05-05	14:30:00	90	Podstawy elektroniki	dr inż. S. Żaba	06	L2	laboratoria	aktywne
cf3c35ef-6c62-4d22-8645-b5c47746969c	IwIKs2	2026-05-05	14:30:00	90	Metody obliczeniowe	mgr inż. K. Hatłas	13	Lk4	laboratoria	aktywne
9d50530b-c59e-4148-ae34-c634887d0138	IwIKs2	2026-05-05	14:30:00	90	Elektrotechnika	dr inż. K. Hawron	04	L1	laboratoria	aktywne
af68a524-4afc-42e6-973c-c9700f7e26ea	IwIKs2	2026-05-05	16:15:00	90	Podstawy elektroniki	dr inż. S. Żaba	06	L3	laboratoria	aktywne
d8f59651-6545-4319-91e1-345a89cf1a88	IwIKs2	2026-05-05	18:00:00	90	Podstawy elektroniki	dr inż. S. Żaba	06	L4	laboratoria	aktywne
dcf324a6-1675-4a89-8415-0f791586b8de	IwIKs2	2026-05-06	07:30:00	180	Wychowanie fizyczne	CSiR	H/C	C	laboratoria	aktywne
d00baa31-b409-4ded-807c-98f771445815	IwIKs2	2026-05-06	11:00:00	90	Nauka, technika i społeczeństwo	prof. K. Węc	A4	S1	laboratoria	aktywne
ea1df1d2-9a92-4e64-bf16-18bbddfaf027	IwIKs2	2026-05-06	12:45:00	90	Metody programowania	prof. Z. Kokosiński	A1	W	wykład	aktywne
1bd59e93-5667-4ece-baa9-561268d1ce6b	IwIKs2	2026-05-06	14:30:00	90	Metody obliczeniowe	dr inż. A. Romańska / dr inż. M. Dudzik	A1	W	wykład	aktywne
039f6a46-c602-44ba-882a-04a4549664a3	IwIKs2	2026-05-07	07:30:00	90	Język angielski	mgr A. Gunia-Tracz	10	Lek3	laboratoria	aktywne
e4235618-8fcb-4d3c-8004-f50d026df497	IwIKs2	2026-05-07	09:15:00	90	Język angielski	mgr A. Gunia-Tracz	10	Lek1	laboratoria	aktywne
bf24f168-da62-47d8-8e54-cc6e041fcd4b	IwIKs2	2026-05-07	09:15:00	90	Elektrotechnika	dr inż. B. Woszczyna	04	L6	laboratoria	aktywne
8da3dbaa-72ef-4077-b5cd-cba99b6641d5	IwIKs2	2026-05-07	09:15:00	90	Metody obliczeniowe	mgr inż. J. Progorowicz	12	Lk3	laboratoria	aktywne
c6e05f9b-573a-4dc2-92a5-3184a4c5a1f9	IwIKs2	2026-05-07	11:00:00	90	Język angielski	mgr A. Gunia-Tracz	10	Lek2	laboratoria	aktywne
02e35ce3-bb53-494c-bb5d-a5bc387f8d22	IwIKs2	2026-05-07	11:00:00	90	Elektrotechnika	dr inż. B. Woszczyna	04	L5	laboratoria	aktywne
5f256f3e-8db0-43a3-aa5b-fbdd101fc11e	IwIKs2	2026-05-07	11:00:00	90	Metody obliczeniowe	mgr inż. J. Progorowicz	12	Lk1	laboratoria	aktywne
9da4079d-592c-4c24-a208-e7dbbfcbdcdb	IwIKs2	2026-05-07	12:45:00	90	Elektrotechnika	dr inż. B. Woszczyna	04	L4	laboratoria	aktywne
6bb526cb-2bea-4016-aa25-6e6171d37a9c	IwIKs2	2026-05-07	12:45:00	90	Programowanie w języku VHDL	dr inż. M. Węgrzyn	201	Lk3	laboratoria	aktywne
c7d92193-3297-4888-808d-a59017bd5215	IwIKs2	2026-05-07	12:45:00	90	Metody obliczeniowe	mgr inż. J. Progorowicz	12	Lk2	laboratoria	aktywne
d5083ac0-ac26-471c-aeb8-ac2d1b5c7591	IwIKs2	2026-05-07	14:30:00	90	Elektrotechnika	dr inż. B. Woszczyna	A1	Ć1	laboratoria	aktywne
d8fb4c5b-48f3-4460-9cc9-0b8faffb3eba	IwIKs2	2026-05-07	14:30:00	90	Programowanie w języku VHDL	dr inż. M. Węgrzyn	201	Lk4	laboratoria	aktywne
bba71d9b-65aa-40b8-86d1-63e998d97a34	IwIKs2	2026-05-08	07:30:00	90	Matematyka dyskretna	dr G. Gancarzewicz	A1	W	wykład	aktywne
6ceb7ce1-35b0-438b-8333-0deb835e5dfe	IwIKs2	2026-05-08	09:15:00	135	Matematyka dyskretna	dr G. Gancarzewicz	A1	Ć1	laboratoria	aktywne
edee3f77-cc86-4d02-99ad-691f3644a39f	IwIKs2	2026-05-08	11:30:00	90	Programowanie w języku VHDL	dr inż. D. Dorota	208G	Lk1	laboratoria	aktywne
bad05982-1337-4911-b673-9f7dc7ffcffa	IwIKs2	2026-05-08	11:45:00	135	Matematyka dyskretna	dr G. Gancarzewicz	A1	Ć2	laboratoria	aktywne
3dea2b1f-d378-463b-a772-c261c50d64ad	IwIKs2	2026-05-08	13:15:00	90	Programowanie w języku VHDL	dr inż. D. Dorota	208G	Lk2	laboratoria	aktywne
5d6d5a2a-148d-4e03-a249-f0de067045a3	IwIKs2	2026-05-11	11:00:00	90	Elektrotechnika	prof. A. Szromba	A3	W	wykład	aktywne
a141688b-288a-434b-b396-75dd5871ce2a	IwIKs2	2026-05-11	12:45:00	90	Programowanie w języku VHDL	dr inż. M. Węgrzyn	A3	W	wykład	aktywne
44004d1d-9e73-47c0-bec6-f598e66a29d3	IwIKs2	2026-05-12	07:00:00	900	Święto Szkoły	Brak	-	Wszystkie grupy	święto	wolne
a1d73152-b2d9-46c8-ab8a-a98c92c13e90	IwIKs2	2026-05-13	07:30:00	180	Wychowanie fizyczne	CSiR	H/C	C	laboratoria	aktywne
eac3b007-fb84-40bb-8988-14741df1c3f9	IwIKs2	2026-05-13	11:00:00	90	Nauka, technika i społeczeństwo	prof. K. Węc	A4	S2	laboratoria	aktywne
802fbaf7-d87b-42c7-9061-c885c566e371	IwIKs2	2026-05-13	12:45:00	90	Metody programowania	prof. Z. Kokosiński	A1	W	wykład	aktywne
0efad43d-c235-4391-8f86-2c01d4ebd5f0	IwIKs2	2026-05-13	14:30:00	90	Metody obliczeniowe	dr inż. A. Romańska / dr inż. M. Dudzik	A1	W	wykład	aktywne
e14214d7-553d-410e-a18e-7048f85487ce	IwIKs2	2026-05-14	07:30:00	90	Język angielski	mgr A. Gunia-Tracz	10	Lek3	laboratoria	aktywne
5f50d6d5-9dbe-4ae4-bbc9-accc59046d83	IwIKs2	2026-05-14	09:15:00	90	Język angielski	mgr A. Gunia-Tracz	10	Lek1	laboratoria	aktywne
ecbcf4ae-2024-42b4-86a3-0cdb65b0e0bb	IwIKs2	2026-05-14	11:00:00	90	Język angielski	mgr A. Gunia-Tracz	10	Lek2	laboratoria	aktywne
f03cfc76-b04f-4de9-9037-a60c9665bb86	IwIKs2	2026-05-14	12:45:00	90	Programowanie w języku VHDL	dr inż. M. Węgrzyn	201	Lk3	laboratoria	aktywne
d6aaba4c-4348-4730-82f1-9f04c6da73bc	IwIKs2	2026-05-14	14:30:00	90	Programowanie w języku VHDL	dr inż. M. Węgrzyn	201	Lk4	laboratoria	aktywne
0c34bbb3-cdb4-49fc-a2ec-8eef4495b867	IwIKs2	2026-05-14	16:15:00	90	Elektrotechnika	dr inż. B. Woszczyna	A4	Ć2	laboratoria	aktywne
2a8c023e-8abc-4b8a-bc9d-119a6a6b6f84	IwIKs2	2026-05-15	07:30:00	90	Matematyka dyskretna	dr G. Gancarzewicz	A1	W	wykład	aktywne
c1529f3b-b1f7-435f-957e-0fc7149f9a1a	IwIKs2	2026-05-15	09:15:00	135	Matematyka dyskretna	dr G. Gancarzewicz	A1	Ć1	laboratoria	aktywne
c0953c83-0394-4b0c-b725-9e41f1c3af19	IwIKs2	2026-05-15	11:30:00	90	Programowanie w języku VHDL	dr inż. D. Dorota	208G	Lk1	laboratoria	aktywne
d1663a3b-52f2-4ac0-99c8-3a7db31d7d6d	IwIKs2	2026-05-15	11:45:00	135	Matematyka dyskretna	dr G. Gancarzewicz	A1	Ć2	laboratoria	aktywne
9f12dd75-42cd-45b0-9817-418aec4ca05f	IwIKs2	2026-05-15	13:15:00	90	Programowanie w języku VHDL	dr inż. D. Dorota	208G	Lk2	laboratoria	aktywne
39e35790-4062-44c1-a52d-b3861a5abdb3	IwIKs2	2026-05-18	11:00:00	90	Elektrotechnika	prof. A. Szromba	A3	W	wykład	aktywne
e355254a-08dc-423e-823e-28b3b9e6192e	IwIKs2	2026-05-18	18:00:00	90	Podstawy elektroniki	dr inż. A. Drwal	A3	W	wykład	aktywne
cb415319-7f16-45d3-a0e7-45c09ac732de	IwIKs2	2026-05-19	07:30:00	90	Metody programowania	mgr inż. G. Nowakowski	202	Lk1	laboratoria	aktywne
ca20f1ab-eca6-4a3a-bc96-80a965d41169	IwIKs2	2026-05-19	07:30:00	90	Podstawy elektroniki	dr inż. A. Drwal	06	L5	laboratoria	aktywne
edec7645-4b8e-4a37-a195-5a57bb1931ca	IwIKs2	2026-05-19	09:15:00	90	Metody programowania	mgr inż. G. Nowakowski	202	Lk2	laboratoria	aktywne
23460678-df79-41a7-b557-e45e650c2a9d	IwIKs2	2026-05-19	09:15:00	90	Podstawy elektroniki	dr inż. A. Drwal	06	L6	laboratoria	aktywne
e08385ff-2f1a-4da7-9b36-f9d669d8d5f2	IwIKs2	2026-05-19	11:00:00	90	Metody programowania	mgr inż. G. Nowakowski	202	Lk3	laboratoria	aktywne
3c1b9a4e-0c7b-4ffa-8e9b-d0ad1cc4a039	IwIKs2	2026-05-19	12:45:00	90	Metody programowania	mgr inż. G. Nowakowski	202	Lk4	laboratoria	aktywne
05e60fca-1dec-4e20-b90c-8929c9b8f1a8	IwIKs2	2026-05-19	12:45:00	90	Podstawy elektroniki	dr inż. S. Żaba	06	L1	laboratoria	aktywne
f6def362-82db-4b35-a0cb-48cefec3285e	IwIKs2	2026-05-19	14:30:00	90	Podstawy elektroniki	dr inż. S. Żaba	06	L2	laboratoria	aktywne
a3946d75-103d-446e-9b63-067b954b3b3d	IwIKs2	2026-05-19	14:30:00	90	Elektrotechnika	dr inż. K. Hawron	04	L1	laboratoria	aktywne
cb15e440-388b-4326-853f-e4df747bad1c	IwIKs2	2026-05-19	16:15:00	90	Podstawy elektroniki	dr inż. S. Żaba	06	L3	laboratoria	aktywne
bfe45d1d-81ad-40f9-a38e-9a1cf6489470	IwIKs2	2026-05-19	18:00:00	90	Podstawy elektroniki	dr inż. S. Żaba	06	L4	laboratoria	aktywne
2ffa6786-b7dc-479e-9b96-7f0bc07a7545	IwIKs2	2026-05-20	07:30:00	180	Wychowanie fizyczne	CSiR	H/C	C	laboratoria	aktywne
d31fb0c2-3479-4511-80ff-4ffd9257e053	IwIKs2	2026-05-20	11:00:00	90	Nauka, technika i społeczeństwo	prof. K. Węc	A4	S1	laboratoria	aktywne
549c6280-4533-4b67-aeb6-876e1f7225a2	IwIKs2	2026-05-20	12:45:00	90	Metody programowania	prof. Z. Kokosiński	A1	W	wykład	aktywne
d3014da6-ec3e-4c37-bb59-34ef1557b889	IwIKs2	2026-05-20	14:30:00	90	Metody obliczeniowe	dr inż. A. Romańska / dr inż. M. Dudzik	A1	W	wykład	aktywne
535611f8-4f4c-4ed6-bb1a-25914335c9fa	IwIKs2	2026-05-21	07:30:00	90	Język angielski	mgr A. Gunia-Tracz	10	Lek3	laboratoria	aktywne
c83dba68-fd6e-40ec-a268-fc7639fcdf0e	IwIKs2	2026-05-21	09:15:00	90	Język angielski	mgr A. Gunia-Tracz	10	Lek1	laboratoria	aktywne
af34dc8c-9b5b-4105-967a-f909e4db2d47	IwIKs2	2026-05-21	11:00:00	90	Język angielski	mgr A. Gunia-Tracz	10	Lek2	laboratoria	aktywne
77702d6c-2d20-423f-b573-cebe89912cd4	IwIKs2	2026-05-21	12:45:00	90	Programowanie w języku VHDL	dr inż. M. Węgrzyn	201	Lk3	laboratoria	aktywne
fd9a3caa-8e39-431e-9f59-139195b7cfbe	IwIKs2	2026-05-21	13:45:00	135	Elektrotechnika	dr inż. B. Woszczyna	A1	Ć1	laboratoria	aktywne
11b3f36e-0237-4431-97f3-eb12b2a0a6e8	IwIKs2	2026-05-21	14:30:00	90	Programowanie w języku VHDL	dr inż. M. Węgrzyn	201	Lk4	laboratoria	aktywne
cad6db32-9588-41b8-ba1a-fa8c82555f91	IwIKs2	2026-05-21	15:00:00	135	Metody programowania	mgr inż. G. Nowakowski	202	P3	laboratoria	aktywne
9d32e1f9-c22d-4821-b3c7-fd5946b6e638	IwIKs2	2026-05-22	07:30:00	180	Matematyka dyskretna	dr G. Gancarzewicz	A1	W	wykład	aktywne
b480980c-d834-4c5d-affa-0474ba1a1864	IwIKs2	2026-05-22	11:00:00	90	Programowanie w języku VHDL	dr inż. D. Dorota	208G	Lk1	laboratoria	aktywne
979cbf30-9fcb-4b67-a757-90e320c27d9d	IwIKs2	2026-05-22	11:00:00	90	Matematyka dyskretna	dr G. Gancarzewicz	A1	Ć2	laboratoria	aktywne
d42007c3-54c3-41cf-8fce-cedc8918afdb	IwIKs2	2026-05-22	12:45:00	90	Programowanie w języku VHDL	dr inż. D. Dorota	208G	Lk2	laboratoria	aktywne
b6fe7547-3245-4b21-8763-c10b8aba6d10	IwIKs2	2026-05-22	14:30:00	90	Matematyka dyskretna	dr G. Gancarzewicz	A1	Ć1	laboratoria	aktywne
f0e8ea7a-103b-4950-a2cb-c34c4cb03c33	IwIKs2	2026-05-24	07:00:00	900	Zielone Świątki	Brak	-	Wszystkie grupy	święto	wolne
90b3757b-a3c5-4207-aec5-f54b99d59fe4	IwIKs2	2026-05-25	11:00:00	90	Elektrotechnika	prof. A. Szromba	A3	W	wykład	aktywne
489b66ea-6711-4898-82f7-8afe4855df55	IwIKs2	2026-05-26	07:30:00	90	Metody programowania	mgr inż. G. Nowakowski	202	Lk1	laboratoria	aktywne
cfb63c02-8e61-4f95-8522-b250da6c6d44	IwIKs2	2026-05-26	07:30:00	90	Podstawy elektroniki	dr inż. A. Drwal	06	L5	laboratoria	aktywne
a61bd2ab-960d-43d5-90f6-167bbb1fc6e7	IwIKs2	2026-05-26	09:15:00	90	Metody programowania	mgr inż. G. Nowakowski	202	Lk2	laboratoria	aktywne
2faa7f60-4877-4de9-a90f-9e198948f9e4	IwIKs2	2026-05-26	09:15:00	90	Podstawy elektroniki	dr inż. A. Drwal	06	L6	laboratoria	aktywne
38e3faa8-8890-493c-812d-1ca5de94b29b	IwIKs2	2026-05-26	11:00:00	90	Metody programowania	mgr inż. G. Nowakowski	202	Lk3	laboratoria	aktywne
57eab35d-079d-4013-a135-5b9df81fef92	IwIKs2	2026-05-26	12:45:00	90	Metody programowania	mgr inż. G. Nowakowski	202	Lk4	laboratoria	aktywne
99e95f4e-e7fa-4c4a-a6aa-951fefd3d271	IwIKs2	2026-05-26	12:45:00	90	Podstawy elektroniki	dr inż. S. Żaba	06	L1	laboratoria	aktywne
71215995-4f53-42cb-af9d-50c07480f05e	IwIKs2	2026-05-26	14:30:00	90	Podstawy elektroniki	dr inż. S. Żaba	06	L2	laboratoria	aktywne
1aeac7f8-ed55-44db-beeb-b8640b8bc3f3	IwIKs2	2026-05-26	14:30:00	90	Elektrotechnika	dr inż. K. Hawron	04	L1	laboratoria	aktywne
7e4c436b-e5ae-4e38-8eb0-4412031a363b	IwIKs2	2026-05-26	16:15:00	90	Podstawy elektroniki	dr inż. S. Żaba	06	L3	laboratoria	aktywne
cb21f906-3e77-42bc-88b0-fb030a246a06	IwIKs2	2026-05-26	18:00:00	90	Podstawy elektroniki	dr inż. S. Żaba	06	L4	laboratoria	aktywne
9315e155-fb0a-4f14-aa09-49320037fa97	IwIKs2	2026-05-27	07:30:00	180	Wychowanie fizyczne	CSiR	H/C	C	laboratoria	aktywne
c18bb560-1342-4f28-8883-5a282901060b	IwIKs2	2026-05-27	11:00:00	90	Nauka, technika i społeczeństwo	prof. K. Węc	A4	S2	laboratoria	aktywne
e373f6ab-6874-4581-b2af-cf5dbe0fb8d6	IwIKs2	2026-05-27	12:45:00	90	Metody programowania	prof. Z. Kokosiński	A1	W	wykład	aktywne
a0557425-1581-4d9c-bcb9-7aea6962d042	IwIKs2	2026-05-27	14:30:00	90	Metody obliczeniowe	dr inż. A. Romańska / dr inż. M. Dudzik	A1	W	wykład	aktywne
178c4102-d807-4a88-950e-4f14b7324c77	IwIKs2	2026-05-28	07:30:00	90	Język angielski	mgr A. Gunia-Tracz	10	Lek3	laboratoria	aktywne
d3ecd551-8a79-4da1-9f70-8d787e447604	IwIKs2	2026-05-28	09:15:00	90	Język angielski	mgr A. Gunia-Tracz	10	Lek1	laboratoria	aktywne
f1e883d9-d1ed-493a-a697-a87d17fbcafb	IwIKs2	2026-05-28	11:00:00	90	Język angielski	mgr A. Gunia-Tracz	10	Lek2	laboratoria	aktywne
bea3a9f6-bd34-4d9f-af67-808df052a517	IwIKs2	2026-05-28	12:45:00	90	Programowanie w języku VHDL	dr inż. M. Węgrzyn	201	Lk3	laboratoria	aktywne
66e6d572-8951-4826-99d2-ac6d6aa97d63	IwIKs2	2026-05-28	14:30:00	90	Programowanie w języku VHDL	dr inż. M. Węgrzyn	201	Lk4	laboratoria	aktywne
10818a30-8bbc-4787-9bee-047feebbddec	IwIKs2	2026-05-28	15:00:00	135	Metody programowania	mgr inż. G. Nowakowski	202	P2	laboratoria	aktywne
57bfff49-c138-4a68-9427-0111ca52fc95	IwIKs2	2026-05-28	16:15:00	90	Elektrotechnika	dr inż. B. Woszczyna	A4	Ć2	laboratoria	aktywne
834c450f-0d95-49e1-a53b-45fb72eca5f3	IwIKs2	2026-05-29	07:30:00	90	Matematyka dyskretna	dr G. Gancarzewicz	A1	W	wykład	aktywne
43a8accc-2a52-4080-80ee-286695b91d95	IwIKs2	2026-05-29	09:15:00	90	Matematyka dyskretna	dr G. Gancarzewicz	A1	Ć1	laboratoria	aktywne
1767c680-a9d5-4597-8eb0-f6c2f556a95e	IwIKs2	2026-05-29	11:00:00	90	Programowanie w języku VHDL	dr inż. D. Dorota	208G	Lk1	laboratoria	aktywne
9d547df3-6400-4d21-bd9d-c70a1ec57da6	IwIKs2	2026-05-29	11:00:00	90	Matematyka dyskretna	dr G. Gancarzewicz	A1	Ć2	laboratoria	aktywne
1c2385da-468d-49ed-90d4-5aa9cb21bfcf	IwIKs2	2026-05-29	12:45:00	90	Programowanie w języku VHDL	dr inż. D. Dorota	208G	Lk2	laboratoria	aktywne
4f557d23-d5cb-46c9-a3c9-668d80fe5606	IwIKs2	2026-06-01	11:00:00	90	Elektrotechnika	prof. A. Szromba	A3	W	wykład	aktywne
37ad1b8a-ffa1-4ff0-993e-03b19c372e66	IwIKs2	2026-06-01	18:00:00	90	Podstawy elektroniki	dr inż. A. Drwal	A3	W	wykład	aktywne
f33122db-e65c-49af-a8da-7fb96cf32127	IwIKs2	2026-06-02	07:30:00	90	Metody programowania	mgr inż. G. Nowakowski	202	Lk1	laboratoria	aktywne
ee87da01-4195-4f8d-b35d-b14b3bcc057d	IwIKs2	2026-06-02	07:30:00	90	Podstawy elektroniki	dr inż. A. Drwal	06	L5	laboratoria	aktywne
9b1e0e43-f0ca-41ef-9ae9-801416d29bf4	IwIKs2	2026-06-02	09:15:00	90	Metody programowania	mgr inż. G. Nowakowski	202	Lk2	laboratoria	aktywne
963cb0cd-160e-4617-a9f3-0ef637f32557	IwIKs2	2026-06-02	09:15:00	90	Podstawy elektroniki	dr inż. A. Drwal	06	L6	laboratoria	aktywne
2819b7ed-5991-49b8-8db0-b3d124a47ea1	IwIKs2	2026-06-02	11:00:00	90	Metody programowania	mgr inż. G. Nowakowski	202	Lk3	laboratoria	aktywne
b4bcbd9a-36bb-41c8-9082-d9967ebdb6e8	IwIKs2	2026-06-02	12:45:00	90	Metody programowania	mgr inż. G. Nowakowski	202	Lk4	laboratoria	aktywne
b6139f4f-9be1-4f6a-b7ee-440161dd6e38	IwIKs2	2026-06-02	12:45:00	90	Podstawy elektroniki	dr inż. S. Żaba	06	L1	laboratoria	aktywne
24c1e70f-c3ea-48ee-88c0-778600678cb0	IwIKs2	2026-06-02	14:30:00	90	Podstawy elektroniki	dr inż. S. Żaba	06	L2	laboratoria	aktywne
372b2b54-2e2b-497d-941f-78d76236bf3b	IwIKs2	2026-06-02	14:30:00	90	Elektrotechnika	dr inż. K. Hawron	04	L1	laboratoria	aktywne
67f4bd9f-4a35-419e-b2c9-c224d92a1d40	IwIKs2	2026-06-02	16:15:00	90	Podstawy elektroniki	dr inż. S. Żaba	06	L3	laboratoria	aktywne
503789b7-7c08-4432-af57-10c1ffedcdd0	IwIKs2	2026-06-02	18:00:00	90	Podstawy elektroniki	dr inż. S. Żaba	06	L4	laboratoria	aktywne
9d598310-2b93-4680-876f-8da7f6db03c7	IwIKs2	2026-06-03	07:30:00	180	Wychowanie fizyczne	CSiR	H/C	C	laboratoria	aktywne
c1879d29-c967-4f65-be2e-48bf996f6c03	IwIKs2	2026-06-03	11:00:00	45	Nauka, technika i społeczeństwo	prof. K. Węc	A4	S1	laboratoria	aktywne
b55c1f45-7437-4263-a4b5-fc1836c33bf1	IwIKs2	2026-06-03	12:45:00	90	Metody programowania	prof. Z. Kokosiński	A1	W	wykład	aktywne
8feccae3-b60e-4216-8ed5-448286dd9aa4	IwIKs2	2026-06-03	14:30:00	90	Metody obliczeniowe	dr inż. A. Romańska / dr inż. M. Dudzik	A1	W	wykład	aktywne
849b7d3f-225d-43aa-97fd-794f4d51e6e0	IwIKs2	2026-06-04	07:00:00	900	Boże Ciało	Brak	-	Wszystkie grupy	święto	wolne
a418656f-6496-46ea-ae03-c1e7305c9e2d	IwIKs2	2026-06-05	07:00:00	900	Boże Ciało	Brak	-	Wszystkie grupy	święto	wolne
b58267ba-d01b-4d38-b259-e2a6b70ef588	IwIKs2	2026-06-08	11:00:00	90	Elektrotechnika	prof. A. Szromba	A3	W	wykład	aktywne
b22d47ea-c728-4b7a-adec-f4a48c7c3570	IwIKs2	2026-06-09	07:30:00	90	Metody programowania	mgr inż. G. Nowakowski	202	Lk1	laboratoria	aktywne
efe90d80-5b2b-4478-85f5-1aca539fae8c	IwIKs2	2026-06-09	07:30:00	90	Podstawy elektroniki	dr inż. A. Drwal	06	L5	laboratoria	aktywne
e1b55761-0d38-443f-b432-af80918078c6	IwIKs2	2026-06-09	09:15:00	90	Metody programowania	mgr inż. G. Nowakowski	202	Lk2	laboratoria	aktywne
ebf277da-80ca-4b03-add2-7760797872bb	IwIKs2	2026-06-09	09:15:00	90	Podstawy elektroniki	dr inż. A. Drwal	06	L6	laboratoria	aktywne
55526ed6-d751-488e-88a2-6f5f5f0d4c17	IwIKs2	2026-06-09	11:00:00	90	Metody programowania	mgr inż. G. Nowakowski	202	Lk3	laboratoria	aktywne
69fb2800-d011-4350-af4e-ca450ce16b4b	IwIKs2	2026-06-09	12:45:00	90	Metody programowania	mgr inż. G. Nowakowski	202	Lk4	laboratoria	aktywne
cf6e7d58-409b-47c7-8986-9e13268fe436	IwIKs2	2026-06-09	12:45:00	90	Podstawy elektroniki	dr inż. S. Żaba	06	L1	laboratoria	aktywne
3fc2a1a0-fe5a-400f-954d-1947dee04849	IwIKs2	2026-06-09	14:30:00	90	Podstawy elektroniki	dr inż. S. Żaba	06	L2	laboratoria	aktywne
b4d81e08-e250-4626-85df-616333e1c7e7	IwIKs2	2026-06-09	14:30:00	90	Elektrotechnika	dr inż. K. Hawron	04	L1	laboratoria	aktywne
ba23265b-270e-4794-a845-c0fae243a30c	IwIKs2	2026-06-09	16:15:00	90	Podstawy elektroniki	dr inż. S. Żaba	06	L3	laboratoria	aktywne
5202bf00-0c9e-49a3-8004-c28199d55a37	IwIKs2	2026-06-09	18:00:00	90	Podstawy elektroniki	dr inż. S. Żaba	06	L4	laboratoria	aktywne
1917b8a6-0e03-4f9a-a8c2-9950b7ae0220	IwIKs2	2026-06-10	07:30:00	180	Wychowanie fizyczne	CSiR	H/C	C	laboratoria	aktywne
61a32ede-93a4-4545-9504-855fb3418333	IwIKs2	2026-06-10	11:00:00	90	Nauka, technika i społeczeństwo	prof. K. Węc	A4	S2	laboratoria	aktywne
128f5fba-4a73-45a6-b618-354d30fa8490	IwIKs2	2026-06-10	12:45:00	90	Metody programowania	prof. Z. Kokosiński	A1	W	wykład	aktywne
28ab1ffb-49f2-4b33-96f3-8338727701ce	IwIKs2	2026-06-10	14:30:00	90	Metody obliczeniowe	dr inż. A. Romańska / dr inż. M. Dudzik	A1	W	wykład	aktywne
fb9d2bfd-87fb-48b1-9c48-ecc300051d9d	IwIKs2	2026-06-11	07:30:00	90	Język angielski	mgr A. Gunia-Tracz	10	Lek3	laboratoria	aktywne
57e64e70-1ede-485f-b123-969eaae09a7f	IwIKs2	2026-06-11	09:15:00	90	Język angielski	mgr A. Gunia-Tracz	10	Lek1	laboratoria	aktywne
67a76e74-6884-4f47-8507-96e12c98a9c6	IwIKs2	2026-06-11	11:00:00	90	Język angielski	mgr A. Gunia-Tracz	10	Lek2	laboratoria	aktywne
8fdb614e-afef-4c2d-af4d-527910186595	IwIKs2	2026-06-11	12:45:00	90	Programowanie w języku VHDL	dr inż. M. Węgrzyn	201	Lk3	laboratoria	aktywne
7b96f698-96ec-4828-b655-5056b80b30e7	IwIKs2	2026-06-11	14:30:00	90	Programowanie w języku VHDL	dr inż. M. Węgrzyn	201	Lk4	laboratoria	aktywne
5ddeee77-5515-4b38-a1cd-a80c7a111540	IwIKs2	2026-06-11	15:00:00	135	Metody programowania	mgr inż. G. Nowakowski	202	P1	laboratoria	aktywne
d45336d4-c9f6-40bc-8ee4-72237dc6eff6	IwIKs2	2026-06-11	16:15:00	135	Elektrotechnika	dr inż. B. Woszczyna	A4	Ć2	laboratoria	aktywne
cebd9cb9-7ad2-4fb6-9322-39bb23e162cc	IwIKs2	2026-06-12	07:30:00	90	Matematyka dyskretna	dr G. Gancarzewicz	A1	W	wykład	aktywne
1c64c5f0-dfc9-49c2-bea1-c7df8b0fb562	IwIKs2	2026-06-12	09:15:00	90	Matematyka dyskretna	dr G. Gancarzewicz	A1	Ć1	laboratoria	aktywne
4c7ebff7-897f-4ca5-aa78-5c2809d1ae03	IwIKs2	2026-06-12	11:00:00	90	Programowanie w języku VHDL	dr inż. D. Dorota	208G	Lk1	laboratoria	aktywne
66a543d5-15f2-4aa1-9278-01f108a36a87	IwIKs2	2026-06-12	11:00:00	90	Matematyka dyskretna	dr G. Gancarzewicz	A1	Ć2	laboratoria	aktywne
ce7d377a-32f9-43ff-9d98-dae99455485e	IwIKs2	2026-06-12	12:45:00	90	Programowanie w języku VHDL	dr inż. D. Dorota	208G	Lk2	laboratoria	aktywne
c52c0ead-7d63-4570-a9c6-41f4f11b1afc	IwIKs2	2026-06-15	11:00:00	90	Elektrotechnika	prof. A. Szromba	A3	W	wykład	aktywne
818f4857-74b6-4ec5-800a-fea3d6a75eaa	IwIKs2	2026-06-16	07:30:00	90	Metody programowania	mgr inż. G. Nowakowski	202	Lk1	laboratoria	aktywne
a3718182-f4fd-4e8c-958c-044bf00f21d2	IwIKs2	2026-06-16	07:30:00	90	Podstawy elektroniki	dr inż. A. Drwal	06	L5	laboratoria	aktywne
86e86689-8b0a-46c7-9c65-62d22cf0ca47	IwIKs2	2026-06-16	09:15:00	90	Metody programowania	mgr inż. G. Nowakowski	202	Lk2	laboratoria	aktywne
f08517aa-435a-4a64-bb5a-b6dea28ad424	IwIKs2	2026-06-16	09:15:00	90	Podstawy elektroniki	dr inż. A. Drwal	06	L6	laboratoria	aktywne
cc14b00b-2413-420c-88a5-3eb3d8329493	IwIKs2	2026-06-16	11:00:00	90	Metody programowania	mgr inż. G. Nowakowski	202	Lk3	laboratoria	aktywne
d5348577-11f2-4a52-8ce4-6c548ae01835	IwIKs2	2026-06-16	12:45:00	90	Metody programowania	mgr inż. G. Nowakowski	202	Lk4	laboratoria	aktywne
178b8fd2-63fa-43c7-9d04-e810039e5786	IwIKs2	2026-06-16	12:45:00	90	Podstawy elektroniki	dr inż. S. Żaba	06	L1	laboratoria	aktywne
dbf9990d-478e-4c0f-bb8f-d7165d57b744	IwIKs2	2026-06-16	14:30:00	90	Podstawy elektroniki	dr inż. S. Żaba	06	L2	laboratoria	aktywne
3f19c205-b79b-46e9-b073-af08ef5433c2	IwIKs2	2026-06-16	14:30:00	90	Elektrotechnika	dr inż. K. Hawron	04	L1	laboratoria	aktywne
153dd3b2-870f-4f8b-b7ac-b344a6192627	IwIKs2	2026-06-16	16:15:00	90	Podstawy elektroniki	dr inż. S. Żaba	06	L3	laboratoria	aktywne
677f748e-e6f6-4330-8827-6750d3d12077	IwIKs2	2026-06-16	18:00:00	90	Podstawy elektroniki	dr inż. S. Żaba	06	L4	laboratoria	aktywne
0b8d1824-3f64-41bb-b05a-111b7b4b0bd0	IwIKs4	2026-02-23	09:15:00	90	Sieci komputerowe	mgr inż. K. Kiełkowicz	A4	W	wykład	aktywne
b61986e6-0963-4502-a994-c056fd9489be	IwIKs4	2026-02-23	11:00:00	135	Sieci komputerowe	mgr inż. K. Kiełkowicz	202	L6	laboratoria	aktywne
7c42cd28-a4fc-49e0-97ec-e89b7353aa37	IwIKs4	2026-02-23	11:00:00	135	Mikroprocesory i mikrokontrolery	mgr inż. M. Raźny	208E	L4	laboratoria	aktywne
e5350d7d-923c-4ad2-b9b6-88379f655997	IwIKs4	2026-02-23	13:30:00	135	Sieci komputerowe	mgr inż. K. Kiełkowicz	202	L5	laboratoria	aktywne
764e254e-0028-43e7-8370-58d209306f12	IwIKs4	2026-02-23	14:30:00	90	Mikroprocesory i mikrokontrolery	dr inż. S. Żaba	06	L6	laboratoria	aktywne
826cac42-d8a7-4e3b-8765-9fcbf0cb06a4	IwIKs4	2026-02-23	16:15:00	90	Mikroprocesory i mikrokontrolery	dr inż. S. Żaba	06	L5	laboratoria	aktywne
117a2d81-c961-4a52-ab39-af6dd0dcc055	IwIKs4	2026-02-23	18:00:00	90	Mikroprocesory i mikrokontrolery	dr inż. S. Żaba	06	P4	laboratoria	aktywne
88958d76-837d-4e98-8344-680a635ded67	IwIKs4	2026-02-24	07:30:00	90	Podstawy baz danych	dr inż. J. Strug	19	Lk1	laboratoria	aktywne
b7a035ae-0491-4b73-b8ec-aab39fd828ed	IwIKs4	2026-02-24	07:30:00	90	Programowanie technik pomiarowych	dr inż. M. Pawlik	201	Lk2	laboratoria	aktywne
13b60b18-a520-47d6-820c-7be60adb4ab2	IwIKs4	2026-02-24	09:15:00	90	Podstawy baz danych	dr inż. J. Strug	19	Lk2	laboratoria	aktywne
a41011d0-29c6-4e03-b867-cb9ff7f6f2b8	IwIKs4	2026-02-24	09:15:00	90	Programowanie technik pomiarowych	dr inż. M. Pawlik	201	Lk3	laboratoria	aktywne
e6ab5ab1-3447-4a81-97d9-731f6f4c079b	IwIKs4	2026-02-24	11:00:00	90	Podstawy baz danych	dr inż. J. Strug	19	Lk3	laboratoria	aktywne
eb327522-12a3-4857-90ba-f041f4251559	IwIKs4	2026-02-24	11:00:00	90	Programowanie technik pomiarowych	dr inż. M. Pawlik	201	Lk4	laboratoria	aktywne
97d56f94-fd60-45e5-957b-0fe374aa8c65	IwIKs4	2026-02-24	12:45:00	90	Podstawy baz danych	dr inż. J. Strug	19	Lk4	laboratoria	aktywne
7e240861-b282-4cac-8bcf-080d777a8625	IwIKs4	2026-02-24	12:45:00	90	Programowanie technik pomiarowych	dr inż. M. Pawlik	201	Lk1	laboratoria	aktywne
f84af3e2-9cdd-49f2-a3e6-e7b0bbba95ef	IwIKs4	2026-02-24	14:30:00	90	Programowanie w języku JAVA	dr inż. S. Bąk	A3	W	wykład	aktywne
19ab7f67-f906-45fc-8cb7-7760c3742eda	IwIKs4	2026-02-24	16:15:00	90	Programowanie w języku JAVA	dr inż. S. Bąk	201	Lk1	laboratoria	aktywne
a805ece8-ebe6-4b4d-9c22-043ded304b05	IwIKs4	2026-02-24	18:00:00	45	Programowanie w języku JAVA	dr inż. S. Bąk	201	P4	laboratoria	aktywne
896a8e40-53c5-44fa-8bd4-4297292011e4	IwIKs4	2026-02-24	18:45:00	45	Programowanie w języku JAVA	dr inż. S. Bąk	201	P3	laboratoria	aktywne
7de9859d-3f8b-41f7-bb67-374a1402e13e	IwIKs4	2026-02-24	19:45:00	45	Programowanie w języku JAVA	dr inż. S. Bąk	201	P2	laboratoria	aktywne
3a10e578-36d2-4301-adb1-fdcc0482ac8f	IwIKs4	2026-02-24	20:30:00	45	Programowanie w języku JAVA	dr inż. S. Bąk	201	P1	laboratoria	aktywne
a3374fcb-e953-44fa-b69d-4725f7633c04	IwIKs4	2026-02-25	09:15:00	90	Język angielski	mgr A. Gunia-Tracz	108D	Lek3	laboratoria	aktywne
57cc40b3-011b-42cb-996b-0208d5f21843	IwIKs4	2026-02-25	09:15:00	90	Programowanie technik pomiarowych	dr inż. M. Pawlik	201	P2	laboratoria	aktywne
aa86df70-919b-4e93-94b2-efd42e1c60d0	IwIKs4	2026-02-25	11:00:00	90	Język angielski	mgr A. Gunia-Tracz	108D	Lek2	laboratoria	aktywne
32fc710e-6f55-43dc-962c-7639feda8283	IwIKs4	2026-02-25	11:00:00	90	Programowanie technik pomiarowych	dr inż. M. Pawlik	201	P1	laboratoria	aktywne
fea6d1a5-5ed0-48b7-99f6-d84d21398e62	IwIKs4	2026-02-25	12:45:00	90	Język angielski	mgr A. Gunia-Tracz	108D	Lek1	laboratoria	aktywne
b4888071-a55e-4356-9ab9-7dd8f078b964	IwIKs4	2026-02-25	12:45:00	90	Programowanie technik pomiarowych	dr inż. M. Pawlik	201	P3	laboratoria	aktywne
0067bffa-9e4f-4501-865d-132cfcd24248	IwIKs4	2026-02-25	14:30:00	90	Programowanie technik pomiarowych	dr inż. M. Pawlik	A3	W	wykład	aktywne
1399e120-6117-4580-aa8c-99ae09a108b3	IwIKs4	2026-02-25	16:15:00	90	Programowanie w języku JAVA	dr inż. S. Bąk	201	Lk2	laboratoria	aktywne
b2ba1725-4678-4127-85d1-07f6cc0be796	IwIKs4	2026-02-25	18:00:00	90	Programowanie w języku JAVA	dr inż. S. Bąk	201	Lk3	laboratoria	aktywne
4a0e1d91-9368-49e6-998b-cc1b713432b8	IwIKs4	2026-02-25	19:45:00	90	Programowanie w języku JAVA	dr inż. S. Bąk	201	Lk4	laboratoria	aktywne
7d656009-8161-40ce-b93b-5a61fd9e23ad	IwIKs4	2026-02-26	07:30:00	135	Sieci komputerowe	mgr inż. G. Nowakowski	202	L3	laboratoria	aktywne
790d998d-fab0-46f1-979d-226dcb066456	IwIKs4	2026-02-26	07:30:00	135	Mikroprocesory i mikrokontrolery	dr inż. A. Drwal	06	L1	laboratoria	aktywne
fe198c50-a186-47be-8d7d-bcdb89e96863	IwIKs4	2026-02-26	10:00:00	135	Sieci komputerowe	mgr inż. G. Nowakowski	202	L2	laboratoria	aktywne
46c61082-e412-4dd6-afc2-bdeb335c4d8c	IwIKs4	2026-02-26	10:00:00	135	Sieci komputerowe	dr inż. P. Król	19	L1	laboratoria	aktywne
b9b49b72-5005-4aba-a833-1b7870762978	IwIKs4	2026-02-26	10:00:00	135	Mikroprocesory i mikrokontrolery	dr inż. K. Suchenia	101B	L3	laboratoria	aktywne
d07dbc99-d4e5-41f8-9b0d-e00959e18591	IwIKs4	2026-02-26	12:30:00	135	Sieci komputerowe	mgr inż. G. Nowakowski	202	L4	laboratoria	aktywne
71d81edd-c7f9-450c-98a3-42281293eb1d	IwIKs4	2026-02-26	12:30:00	135	Mikroprocesory i mikrokontrolery	dr inż. K. Suchenia	101B	L2	laboratoria	aktywne
604c0732-e63d-47d6-84b0-334954019f3a	IwIKs4	2026-02-26	15:00:00	90	Mikroprocesory i mikrokontrolery	dr inż. K. Suchenia	A3	W	wykład	aktywne
62ee8eb7-2554-41ec-9fc2-51f9890766b8	IwIKs4	2026-02-27	07:30:00	90	Podstawy baz danych	dr inż. J. Strug	A2	W	wykład	aktywne
d98af53c-d016-48c2-9d23-ba6614ea59fe	IwIKs4	2026-02-27	09:15:00	90	Podstawy baz danych	dr inż. J. Strug	18	P1	laboratoria	aktywne
12c2d68e-9706-49de-90c7-78badfacfcac	IwIKs4	2026-02-27	11:00:00	90	Podstawy baz danych	dr inż. J. Strug	18	P3	laboratoria	aktywne
2c92355c-44f8-4d78-954e-00b448d19b4f	IwIKs4	2026-03-02	09:15:00	90	Sieci komputerowe	mgr inż. K. Kiełkowicz	A4	W	wykład	aktywne
818deba0-efc1-4c3e-8011-a64d50cba5a1	IwIKs4	2026-03-02	11:00:00	135	Sieci komputerowe	mgr inż. K. Kiełkowicz	202	L6	laboratoria	aktywne
828c3ccc-10dd-41dc-b605-496ecdde3b81	IwIKs4	2026-03-02	11:00:00	135	Mikroprocesory i mikrokontrolery	mgr inż. M. Raźny	208E	L4	laboratoria	aktywne
072e34c3-57b2-475c-8e29-736190e58020	IwIKs4	2026-03-02	13:30:00	135	Sieci komputerowe	mgr inż. K. Kiełkowicz	202	L5	laboratoria	aktywne
14e22570-0d73-43dd-8717-c7a24481ecbf	IwIKs4	2026-03-02	14:30:00	90	Mikroprocesory i mikrokontrolery	dr inż. S. Żaba	06	L6	laboratoria	aktywne
5b1f8332-2fd9-48bd-aab8-2531e193a57f	IwIKs4	2026-03-02	16:15:00	90	Mikroprocesory i mikrokontrolery	dr inż. S. Żaba	06	L5	laboratoria	aktywne
2a850667-d8a7-4416-addb-756654db5207	IwIKs4	2026-03-03	07:30:00	90	Podstawy baz danych	dr inż. J. Strug	19	Lk1	laboratoria	aktywne
3df33067-61ce-46be-aeb2-4c5e7758fadb	IwIKs4	2026-03-03	07:30:00	90	Programowanie technik pomiarowych	dr inż. M. Pawlik	201	Lk2	laboratoria	aktywne
efbea888-1605-411d-b74d-78717e187442	IwIKs4	2026-03-03	09:15:00	90	Podstawy baz danych	dr inż. J. Strug	19	Lk2	laboratoria	aktywne
364f1f30-29eb-4be9-ac29-bb1d7641a1c4	IwIKs4	2026-03-03	09:15:00	90	Programowanie technik pomiarowych	dr inż. M. Pawlik	201	Lk3	laboratoria	aktywne
eaec67bf-6a13-4e8e-9f89-e1360a5f7b06	IwIKs4	2026-03-03	11:00:00	90	Podstawy baz danych	dr inż. J. Strug	19	Lk3	laboratoria	aktywne
e2bdc7f3-9413-44d0-8829-c2d800985bac	IwIKs4	2026-03-03	11:00:00	90	Programowanie technik pomiarowych	dr inż. M. Pawlik	201	Lk4	laboratoria	aktywne
3f74375f-1e51-4032-a30f-0ff8838e5acb	IwIKs4	2026-03-03	12:45:00	90	Podstawy baz danych	dr inż. J. Strug	19	Lk4	laboratoria	aktywne
6226373b-004a-4934-a8d2-1537f990745e	IwIKs4	2026-03-03	12:45:00	90	Programowanie technik pomiarowych	dr inż. M. Pawlik	201	Lk1	laboratoria	aktywne
e1567302-5fb2-4723-ad24-4670c1ae9789	IwIKs4	2026-03-03	14:30:00	90	Programowanie w języku JAVA	dr inż. S. Bąk	A3	W	wykład	aktywne
fdb4acc3-5c35-4b23-984b-e4a331d12a57	IwIKs4	2026-03-03	16:15:00	90	Programowanie w języku JAVA	dr inż. S. Bąk	201	Lk1	laboratoria	aktywne
8cfd6893-506d-4200-9930-b9f005d0aea6	IwIKs4	2026-03-03	18:00:00	90	Programowanie w języku JAVA	dr inż. S. Bąk	201	P3	laboratoria	aktywne
099a26bc-2200-49ae-80e0-61135060c1cf	IwIKs4	2026-03-03	19:45:00	90	Programowanie w języku JAVA	dr inż. S. Bąk	201	P1	laboratoria	aktywne
53989c5e-441b-4e97-8d5b-3275834a6153	IwIKs4	2026-03-04	09:15:00	90	Język angielski	mgr A. Gunia-Tracz	108D	Lek3	laboratoria	aktywne
b0c4f7ef-ee03-46b0-92a4-f6efb489e23a	IwIKs4	2026-03-04	11:00:00	90	Język angielski	mgr A. Gunia-Tracz	108D	Lek2	laboratoria	aktywne
dc7e760d-9dfb-439b-9d6d-3f9246628657	IwIKs4	2026-03-04	12:45:00	90	Język angielski	mgr A. Gunia-Tracz	108D	Lek1	laboratoria	aktywne
c0882d69-f0e5-445b-9c66-1fe95156bd74	IwIKs4	2026-03-04	12:45:00	90	Programowanie technik pomiarowych	dr inż. M. Pawlik	201	P4	laboratoria	aktywne
a3dea730-b5f6-45a0-936f-015f06c31bbc	IwIKs4	2026-03-04	14:30:00	90	Programowanie technik pomiarowych	dr inż. M. Pawlik	A3	W	wykład	aktywne
f6ef11b2-f5fb-4045-b3b8-d9dce1eb8297	IwIKs4	2026-03-04	16:15:00	90	Programowanie w języku JAVA	dr inż. S. Bąk	201	Lk2	laboratoria	aktywne
966bc5ae-b06a-41c9-b67f-f6bf68b5860a	IwIKs4	2026-03-04	18:00:00	90	Programowanie w języku JAVA	dr inż. S. Bąk	201	Lk3	laboratoria	aktywne
e6105d43-aed6-4fed-8cff-752f85b1ad3d	IwIKs4	2026-03-04	19:45:00	90	Programowanie w języku JAVA	dr inż. S. Bąk	201	Lk4	laboratoria	aktywne
b1a10694-4230-41db-92b7-10e74be5ec14	IwIKs4	2026-03-05	07:30:00	135	Sieci komputerowe	mgr inż. G. Nowakowski	202	L3	laboratoria	aktywne
8cf01a51-023b-4564-9ee3-977f1fd6ce35	IwIKs4	2026-03-05	07:30:00	135	Mikroprocesory i mikrokontrolery	dr inż. A. Drwal	06	L1	laboratoria	aktywne
29ebc4d5-b235-4fb9-a2b7-42cce8057384	IwIKs4	2026-03-05	10:00:00	135	Sieci komputerowe	mgr inż. G. Nowakowski	202	L2	laboratoria	aktywne
e7237537-63c6-4422-8f89-302b338b2f3a	IwIKs4	2026-03-05	10:00:00	135	Sieci komputerowe	dr inż. P. Król	19	L1	laboratoria	aktywne
69e7c693-a3e9-4d58-ad11-4e01ecdc44c9	IwIKs4	2026-03-05	10:00:00	135	Mikroprocesory i mikrokontrolery	dr inż. K. Suchenia	101B	L3	laboratoria	aktywne
0be62f88-128a-4bd1-9067-515a232e6f8c	IwIKs4	2026-03-05	12:30:00	135	Sieci komputerowe	mgr inż. G. Nowakowski	202	L4	laboratoria	aktywne
eb5ab1a2-12e4-4864-a295-ad563c8b72a1	IwIKs4	2026-03-05	12:30:00	135	Mikroprocesory i mikrokontrolery	dr inż. K. Suchenia	101B	L2	laboratoria	aktywne
1cac7a48-f0e4-48cd-8a00-96fb0ad0361a	IwIKs4	2026-03-05	15:00:00	90	Mikroprocesory i mikrokontrolery	dr inż. K. Suchenia	A3	W	wykład	aktywne
0b2d07ab-68eb-420c-9214-9fbf180af634	IwIKs4	2026-03-06	07:30:00	90	Podstawy baz danych	dr inż. J. Strug	A2	W	wykład	aktywne
26ec63ee-5383-4de0-999a-abfc72c600b6	IwIKs4	2026-03-06	09:15:00	90	Podstawy baz danych	dr inż. J. Strug	18	P2	laboratoria	aktywne
d3c0288f-1baa-4b38-82d7-8c8ee78c26be	IwIKs4	2026-03-06	11:00:00	90	Podstawy baz danych	dr inż. J. Strug	18	P4	laboratoria	aktywne
647a8434-dd8c-4862-8e57-ce0374b267d3	IwIKs4	2026-03-09	09:15:00	90	Sieci komputerowe	mgr inż. K. Kiełkowicz	A4	W	wykład	aktywne
c0709e93-775f-4d84-9d24-56ea9027db9a	IwIKs4	2026-03-09	11:00:00	135	Sieci komputerowe	mgr inż. K. Kiełkowicz	202	L6	laboratoria	aktywne
e28befbb-624a-46e7-a890-a02dbdeb8fae	IwIKs4	2026-03-09	11:00:00	135	Mikroprocesory i mikrokontrolery	mgr inż. M. Raźny	208E	L4	laboratoria	aktywne
082650ab-2a07-4ade-8984-b6ef1f8124bd	IwIKs4	2026-03-09	13:30:00	135	Sieci komputerowe	mgr inż. K. Kiełkowicz	202	L5	laboratoria	aktywne
f9e16da2-cc60-4883-9fd2-ce3fbaaeba81	IwIKs4	2026-03-09	14:30:00	90	Mikroprocesory i mikrokontrolery	dr inż. S. Żaba	06	L6	laboratoria	aktywne
4725a16a-7476-4c52-bf57-740e658b744e	IwIKs4	2026-03-09	16:15:00	90	Mikroprocesory i mikrokontrolery	dr inż. S. Żaba	06	L5	laboratoria	aktywne
ed20f6ce-6a78-4653-8dea-863446a3fc44	IwIKs4	2026-03-09	18:00:00	90	Mikroprocesory i mikrokontrolery	dr inż. S. Żaba	06	P4	laboratoria	aktywne
c041c080-9fdf-4457-a1a8-91e62b752770	IwIKs4	2026-03-10	07:30:00	90	Podstawy baz danych	dr inż. J. Strug	19	Lk1	laboratoria	aktywne
9981a2b6-15dd-438c-a8af-f6555f2bc55c	IwIKs4	2026-03-10	07:30:00	90	Programowanie technik pomiarowych	dr inż. M. Pawlik	201	Lk2	laboratoria	aktywne
03e74ed3-3670-4599-a1c7-eea619a723de	IwIKs4	2026-03-10	09:15:00	90	Podstawy baz danych	dr inż. J. Strug	19	Lk2	laboratoria	aktywne
c5970e24-2beb-4708-b0bc-f32e91b64c9f	IwIKs4	2026-03-10	09:15:00	90	Programowanie technik pomiarowych	dr inż. M. Pawlik	201	Lk3	laboratoria	aktywne
4a2fa8dc-ef87-432d-aa39-4737d74b0461	IwIKs4	2026-03-10	11:00:00	90	Podstawy baz danych	dr inż. J. Strug	19	Lk3	laboratoria	aktywne
5d4a52d9-3ceb-4e88-9a3d-8b01d0b1570b	IwIKs4	2026-03-10	11:00:00	90	Programowanie technik pomiarowych	dr inż. M. Pawlik	201	Lk4	laboratoria	aktywne
bec05658-cec4-485a-80e8-6c7be81355e0	IwIKs4	2026-03-10	12:45:00	90	Podstawy baz danych	dr inż. J. Strug	19	Lk4	laboratoria	aktywne
677ca617-e13a-4491-bd56-e6670b739715	IwIKs4	2026-03-10	12:45:00	90	Programowanie technik pomiarowych	dr inż. M. Pawlik	201	Lk1	laboratoria	aktywne
2306ecf5-9a69-4840-b21b-c86457fac6c0	IwIKs4	2026-03-10	14:30:00	90	Programowanie w języku JAVA	dr inż. S. Bąk	A3	W	wykład	aktywne
5ee2a3e6-b67a-4517-9da5-020bd3b9ec33	IwIKs4	2026-03-10	16:15:00	90	Programowanie w języku JAVA	dr inż. S. Bąk	201	Lk1	laboratoria	aktywne
4ac6b33e-ad41-4bb7-a069-31b35aa34df8	IwIKs4	2026-03-10	18:00:00	90	Programowanie w języku JAVA	dr inż. S. Bąk	201	P4	laboratoria	aktywne
8b2a47ae-1bb9-40b1-8d9c-beb700090aa1	IwIKs4	2026-03-10	19:45:00	90	Programowanie w języku JAVA	dr inż. S. Bąk	201	P2	laboratoria	aktywne
5e8db77e-e063-43fe-a555-351688ba5d54	IwIKs4	2026-03-11	09:15:00	90	Język angielski	mgr A. Gunia-Tracz	108D	Lek3	laboratoria	aktywne
5b9aa310-786a-4267-b517-406cc0ce65af	IwIKs4	2026-03-11	11:00:00	90	Język angielski	mgr A. Gunia-Tracz	108D	Lek2	laboratoria	aktywne
39c9f484-1d26-4c55-afb9-229d91a684b7	IwIKs4	2026-03-11	12:45:00	90	Język angielski	mgr A. Gunia-Tracz	108D	Lek1	laboratoria	aktywne
11ad153b-145f-4e49-96fe-ac7c10d56e3f	IwIKs4	2026-03-11	14:30:00	90	Programowanie technik pomiarowych	dr inż. M. Pawlik	A3	W	wykład	aktywne
16f11955-ee79-4458-9d94-6d067652fdd4	IwIKs4	2026-03-11	16:15:00	90	Programowanie w języku JAVA	dr inż. S. Bąk	201	Lk2	laboratoria	aktywne
d6c52102-e3c2-43f2-9dad-f5834434990e	IwIKs4	2026-03-11	18:00:00	90	Programowanie w języku JAVA	dr inż. S. Bąk	201	Lk3	laboratoria	aktywne
ecc96db9-00ba-42f0-904c-8a92c03ed41c	IwIKs4	2026-03-11	19:45:00	90	Programowanie w języku JAVA	dr inż. S. Bąk	201	Lk4	laboratoria	aktywne
9f54979f-a65b-4ea8-bcb7-6b4fb0ade9b0	IwIKs4	2026-03-12	07:30:00	135	Sieci komputerowe	mgr inż. G. Nowakowski	202	L3	laboratoria	aktywne
0964175d-0d5d-426e-a0bb-36ce40a04135	IwIKs4	2026-03-12	07:30:00	135	Mikroprocesory i mikrokontrolery	dr inż. A. Drwal	06	L1	laboratoria	aktywne
30095bf8-cdd4-4860-af5f-0d1255731dc0	IwIKs4	2026-03-12	10:00:00	135	Sieci komputerowe	mgr inż. G. Nowakowski	202	L2	laboratoria	aktywne
8203c15e-56bf-48ae-9af5-873a2df14394	IwIKs4	2026-03-12	10:00:00	135	Sieci komputerowe	dr inż. P. Król	19	L1	laboratoria	aktywne
aca59360-1e06-43ab-9d2b-f23f1bb3ffaf	IwIKs4	2026-03-12	10:00:00	135	Mikroprocesory i mikrokontrolery	dr inż. K. Suchenia	101B	L3	laboratoria	aktywne
267bd031-136b-4636-add6-1e42f267dc3b	IwIKs4	2026-03-12	12:30:00	135	Sieci komputerowe	mgr inż. G. Nowakowski	202	L4	laboratoria	aktywne
ffa56715-70c8-4642-9b1b-5af016132ceb	IwIKs4	2026-03-12	12:30:00	135	Mikroprocesory i mikrokontrolery	dr inż. K. Suchenia	101B	L2	laboratoria	aktywne
2814429d-f429-4fc6-ac42-ad18c4bff5ab	IwIKs4	2026-03-12	15:00:00	90	Mikroprocesory i mikrokontrolery	dr inż. K. Suchenia	A3	W	wykład	aktywne
bf7dc22a-d61e-4c33-aace-882bb91864ce	IwIKs4	2026-03-13	07:30:00	90	Podstawy baz danych	dr inż. J. Strug	A2	W	wykład	aktywne
2063f28e-2bf3-4480-8172-30fb0a6215cb	IwIKs4	2026-03-13	09:15:00	90	Podstawy baz danych	dr inż. J. Strug	18	P1	laboratoria	aktywne
0606d4b7-8107-4988-86ff-72fc07f95489	IwIKs4	2026-03-13	11:00:00	90	Podstawy baz danych	dr inż. J. Strug	18	P3	laboratoria	aktywne
24d3aa6b-f0ef-4cde-8173-5973ca62955f	IwIKs4	2026-03-16	09:15:00	90	Sieci komputerowe	mgr inż. K. Kiełkowicz	A4	W	wykład	aktywne
76fa218f-e538-44a9-a5df-e2c73f2b40c3	IwIKs4	2026-03-16	11:00:00	135	Sieci komputerowe	mgr inż. K. Kiełkowicz	202	L6	laboratoria	aktywne
948cdd03-db6a-46e1-ac07-ea88d3b4a997	IwIKs4	2026-03-16	11:00:00	135	Mikroprocesory i mikrokontrolery	mgr inż. M. Raźny	208E	L4	laboratoria	aktywne
6b293fa1-1816-475f-b53e-54b67ca3645f	IwIKs4	2026-03-16	13:30:00	135	Sieci komputerowe	mgr inż. K. Kiełkowicz	202	L5	laboratoria	aktywne
dfdb40c9-8fe7-4f7f-a737-7fe982e8157a	IwIKs4	2026-03-16	14:30:00	90	Mikroprocesory i mikrokontrolery	dr inż. S. Żaba	06	L6	laboratoria	aktywne
378ed4f4-7cca-4d87-a53f-2aeed39f6be5	IwIKs4	2026-03-16	16:15:00	90	Mikroprocesory i mikrokontrolery	dr inż. S. Żaba	06	L5	laboratoria	aktywne
c4b4a631-3453-468f-8cc4-dd883916b6ad	IwIKs4	2026-03-17	07:30:00	90	Podstawy baz danych	dr inż. J. Strug	19	Lk1	laboratoria	aktywne
1c3f5b5a-9ad2-4ab0-aba6-65bd4a9d9fc2	IwIKs4	2026-03-17	07:30:00	90	Programowanie technik pomiarowych	dr inż. M. Pawlik	201	Lk2	laboratoria	aktywne
06068353-9159-42d2-ac96-28f405d0511f	IwIKs4	2026-03-17	09:15:00	90	Podstawy baz danych	dr inż. J. Strug	19	Lk2	laboratoria	aktywne
82346f24-a40e-4f16-be67-0a1a7c24846b	IwIKs4	2026-03-17	09:15:00	90	Programowanie technik pomiarowych	dr inż. M. Pawlik	201	Lk3	laboratoria	aktywne
0beabcba-aa9a-417d-93a6-c67b377a4390	IwIKs4	2026-03-17	11:00:00	90	Podstawy baz danych	dr inż. J. Strug	19	Lk3	laboratoria	aktywne
e475b740-ee86-45af-badc-0737f540198e	IwIKs4	2026-03-17	11:00:00	90	Programowanie technik pomiarowych	dr inż. M. Pawlik	201	Lk4	laboratoria	aktywne
e6598930-b890-4b04-af4e-aa2e341edc14	IwIKs4	2026-03-17	12:45:00	90	Podstawy baz danych	dr inż. J. Strug	19	Lk4	laboratoria	aktywne
3c44cc61-6711-46e4-8b27-604a8c0aa95e	IwIKs4	2026-03-17	12:45:00	90	Programowanie technik pomiarowych	dr inż. M. Pawlik	201	Lk1	laboratoria	aktywne
5874cdee-7498-4fb5-808e-1ff49f2b8c81	IwIKs4	2026-03-17	14:30:00	90	Programowanie w języku JAVA	dr inż. S. Bąk	A3	W	wykład	aktywne
2ae84858-093e-4b53-9d86-4a1bd88dc9ad	IwIKs4	2026-03-17	16:15:00	90	Programowanie w języku JAVA	dr inż. S. Bąk	201	Lk1	laboratoria	aktywne
dc1d8ae6-1bd7-4d0d-995d-98dd005b2c67	IwIKs4	2026-03-17	18:00:00	90	Programowanie w języku JAVA	dr inż. S. Bąk	201	P3	laboratoria	aktywne
5f22c4d3-1e46-46cc-9edd-e38016079c37	IwIKs4	2026-03-17	19:45:00	90	Programowanie w języku JAVA	dr inż. S. Bąk	201	P1	laboratoria	aktywne
277fe154-6845-482e-b643-a09dece366b1	IwIKs4	2026-03-18	09:15:00	90	Język angielski	mgr A. Gunia-Tracz	108D	Lek3	laboratoria	aktywne
749026d7-70ac-4a26-b393-7ae582a4706d	IwIKs4	2026-03-18	11:00:00	90	Język angielski	mgr A. Gunia-Tracz	108D	Lek2	laboratoria	aktywne
bb21c2cf-36a7-4fcc-9c3a-75fdfcae197c	IwIKs4	2026-03-18	12:45:00	90	Język angielski	mgr A. Gunia-Tracz	108D	Lek1	laboratoria	aktywne
931ec95e-e794-47ad-9e93-1140dd552342	IwIKs4	2026-03-18	14:30:00	90	Programowanie technik pomiarowych	dr inż. M. Pawlik	A3	W	wykład	aktywne
73349897-bee2-4bfa-82fd-4180c121f258	IwIKs4	2026-03-18	16:15:00	90	Programowanie w języku JAVA	dr inż. S. Bąk	201	Lk2	laboratoria	aktywne
2e1d502d-3994-40f8-9f12-82bf70c719db	IwIKs4	2026-03-18	18:00:00	90	Programowanie w języku JAVA	dr inż. S. Bąk	201	Lk3	laboratoria	aktywne
4909823e-6a0a-461d-b03c-086ee397faf7	IwIKs4	2026-03-18	19:45:00	90	Programowanie w języku JAVA	dr inż. S. Bąk	201	Lk4	laboratoria	aktywne
9db37135-61e5-4706-8a63-779e0c5acc81	IwIKs4	2026-03-19	07:30:00	135	Sieci komputerowe	mgr inż. G. Nowakowski	202	L3	laboratoria	aktywne
d9651f37-0267-4213-9d11-801a19861264	IwIKs4	2026-03-19	07:30:00	135	Mikroprocesory i mikrokontrolery	dr inż. A. Drwal	06	L1	laboratoria	aktywne
b4095bed-9d1f-4531-ac84-d9537b21c66b	IwIKs4	2026-03-19	10:00:00	135	Sieci komputerowe	mgr inż. G. Nowakowski	202	L2	laboratoria	aktywne
6facb2a2-b14e-4b82-bac6-acf4d8fdf56c	IwIKs4	2026-03-19	10:00:00	135	Sieci komputerowe	dr inż. P. Król	19	L1	laboratoria	aktywne
3e93c628-c758-4bc0-bc17-1725bb2a408c	IwIKs4	2026-03-19	10:00:00	135	Mikroprocesory i mikrokontrolery	dr inż. K. Suchenia	101B	L3	laboratoria	aktywne
dd9a6e35-c189-4a1a-90e1-e764507bd781	IwIKs4	2026-03-19	12:30:00	135	Sieci komputerowe	mgr inż. G. Nowakowski	202	L4	laboratoria	aktywne
8031e771-4310-45cc-af65-9c68e3dd77c1	IwIKs4	2026-03-19	12:30:00	135	Mikroprocesory i mikrokontrolery	dr inż. K. Suchenia	101B	L2	laboratoria	aktywne
0f6699aa-f72d-4e34-8fc0-1d722683c7b7	IwIKs4	2026-03-19	15:00:00	90	Mikroprocesory i mikrokontrolery	dr inż. K. Suchenia	A3	W	wykład	aktywne
a453e10a-7cda-4fb3-99a6-f3efe1243e84	IwIKs4	2026-03-20	07:30:00	90	Podstawy baz danych	dr inż. J. Strug	A2	W	wykład	aktywne
ff5dcfbd-c62b-4774-802c-1c3301b094aa	IwIKs4	2026-03-20	09:15:00	90	Podstawy baz danych	dr inż. J. Strug	18	P2	laboratoria	aktywne
1d21e433-e42e-4c82-ac72-e517fbe240e7	IwIKs4	2026-03-20	11:00:00	90	Podstawy baz danych	dr inż. J. Strug	18	P4	laboratoria	aktywne
384f61f4-32b0-45d8-94f8-3f6ba457ec59	IwIKs4	2026-03-23	09:15:00	90	Sieci komputerowe	mgr inż. K. Kiełkowicz	A4	W	wykład	aktywne
dc86dc56-775c-420b-add9-d62917a9dfe2	IwIKs4	2026-03-23	11:00:00	135	Sieci komputerowe	mgr inż. K. Kiełkowicz	202	L6	laboratoria	aktywne
bcae5c7c-0216-4315-91e9-20e184478d3f	IwIKs4	2026-03-23	11:00:00	135	Mikroprocesory i mikrokontrolery	mgr inż. M. Raźny	208E	L4	laboratoria	aktywne
b495c22a-1bf1-4673-a93a-0b8e6b5ea8ef	IwIKs4	2026-03-23	13:30:00	135	Sieci komputerowe	mgr inż. K. Kiełkowicz	202	L5	laboratoria	aktywne
a99dba45-ae76-4e97-93fc-460a82e3cbed	IwIKs4	2026-03-23	14:30:00	90	Mikroprocesory i mikrokontrolery	dr inż. S. Żaba	06	L6	laboratoria	aktywne
f1095a7c-00d9-4e7f-b105-ac7693f3fa35	IwIKs4	2026-03-23	16:15:00	90	Mikroprocesory i mikrokontrolery	dr inż. S. Żaba	06	L5	laboratoria	aktywne
09a552ab-bd2e-49d4-88db-0178e2b1d8dd	IwIKs4	2026-03-23	18:00:00	90	Mikroprocesory i mikrokontrolery	dr inż. S. Żaba	06	P4	laboratoria	aktywne
e420b35c-9be7-435d-a48f-da4c38751f6b	IwIKs4	2026-03-24	07:30:00	90	Podstawy baz danych	dr inż. J. Strug	19	Lk1	laboratoria	aktywne
3ff6bbe2-9aca-4b74-8960-484eb577b954	IwIKs4	2026-03-24	07:30:00	90	Programowanie technik pomiarowych	dr inż. M. Pawlik	201	Lk2	laboratoria	aktywne
b598170c-02ab-495e-a520-d0d21c90d0cb	IwIKs4	2026-03-24	09:15:00	90	Podstawy baz danych	dr inż. J. Strug	19	Lk2	laboratoria	aktywne
5ea222f7-9ac4-4a6e-8adf-42ceedbf4f62	IwIKs4	2026-03-24	09:15:00	90	Programowanie technik pomiarowych	dr inż. M. Pawlik	201	Lk3	laboratoria	aktywne
21696ac6-90b1-4cbc-b7da-78d4b5bd63c3	IwIKs4	2026-03-24	11:00:00	90	Podstawy baz danych	dr inż. J. Strug	19	Lk3	laboratoria	aktywne
40e577e6-e5c6-4acb-a150-521d25a1c005	IwIKs4	2026-03-24	11:00:00	90	Programowanie technik pomiarowych	dr inż. M. Pawlik	201	Lk4	laboratoria	aktywne
04c73fc8-e16b-44a9-8b5b-a7699695c821	IwIKs4	2026-03-24	12:45:00	90	Podstawy baz danych	dr inż. J. Strug	19	Lk4	laboratoria	aktywne
4b646ea6-a586-4945-8c21-9ac3a5d73de6	IwIKs4	2026-03-24	12:45:00	90	Programowanie technik pomiarowych	dr inż. M. Pawlik	201	Lk1	laboratoria	aktywne
925bf2fe-eae8-46dd-a42b-7659208bf315	IwIKs4	2026-03-24	14:30:00	90	Programowanie w języku JAVA	dr inż. S. Bąk	A3	W	wykład	aktywne
b3a58450-5503-4936-9b79-b73704f9faa7	IwIKs4	2026-03-24	16:15:00	90	Programowanie w języku JAVA	dr inż. S. Bąk	201	Lk1	laboratoria	aktywne
c920c5f4-0c6b-48b2-8710-d7a727102da0	IwIKs4	2026-03-24	18:00:00	90	Programowanie w języku JAVA	dr inż. S. Bąk	201	P4	laboratoria	aktywne
ca9994ce-6176-4368-90cf-edb958348d5e	IwIKs4	2026-03-24	19:45:00	90	Programowanie w języku JAVA	dr inż. S. Bąk	201	P2	laboratoria	aktywne
d97de520-0913-487e-8a39-c81e67e1d5b3	IwIKs4	2026-03-25	09:15:00	90	Język angielski	mgr A. Gunia-Tracz	108D	Lek3	laboratoria	aktywne
4e5fe3c6-1763-49eb-b283-0337780d70cc	IwIKs4	2026-03-25	11:00:00	90	Język angielski	mgr A. Gunia-Tracz	108D	Lek2	laboratoria	aktywne
701302ce-c8fc-431d-a8cc-e32c76a6578e	IwIKs4	2026-03-25	12:45:00	90	Język angielski	mgr A. Gunia-Tracz	108D	Lek1	laboratoria	aktywne
8f00aa33-3a6c-4fb6-bc5c-e550ad2a3eed	IwIKs4	2026-03-25	14:30:00	90	Programowanie technik pomiarowych	dr inż. M. Pawlik	A3	W	wykład	aktywne
6ba7489e-ba5b-446a-9118-52ffda97c92e	IwIKs4	2026-03-25	16:15:00	90	Programowanie w języku JAVA	dr inż. S. Bąk	201	Lk2	laboratoria	aktywne
541ef9d9-bcf7-4cf0-b0fc-b2e81f01b942	IwIKs4	2026-03-25	18:00:00	90	Programowanie w języku JAVA	dr inż. S. Bąk	201	Lk3	laboratoria	aktywne
e038b216-bb08-44f6-9765-0c16dd834149	IwIKs4	2026-03-25	19:45:00	90	Programowanie w języku JAVA	dr inż. S. Bąk	201	Lk4	laboratoria	aktywne
645a9ec4-e1cf-4ab7-ad4c-47e1612b0b58	IwIKs4	2026-03-26	07:30:00	135	Sieci komputerowe	mgr inż. G. Nowakowski	202	L3	laboratoria	aktywne
4297d064-36e5-47d8-9359-0c30ebbe891c	IwIKs4	2026-03-26	07:30:00	135	Mikroprocesory i mikrokontrolery	dr inż. A. Drwal	06	L1	laboratoria	aktywne
700f80ee-afa5-4b5f-8960-d955d2690eb3	IwIKs4	2026-03-26	10:00:00	135	Sieci komputerowe	mgr inż. G. Nowakowski	202	L2	laboratoria	aktywne
160566ef-8c46-4f8c-99e4-85fbe8ffa526	IwIKs4	2026-03-26	10:00:00	135	Sieci komputerowe	dr inż. P. Król	19	L1	laboratoria	aktywne
619d1811-a45f-47ec-bcc7-5bb5777b3746	IwIKs4	2026-03-26	10:00:00	135	Mikroprocesory i mikrokontrolery	dr inż. K. Suchenia	101B	L3	laboratoria	aktywne
d5948464-21ba-4dec-934b-e61699046493	IwIKs4	2026-03-26	12:30:00	135	Sieci komputerowe	mgr inż. G. Nowakowski	202	L4	laboratoria	aktywne
a2c9cb5b-fc46-4967-ad9f-0a03eb703725	IwIKs4	2026-03-26	12:30:00	135	Mikroprocesory i mikrokontrolery	dr inż. K. Suchenia	101B	L2	laboratoria	aktywne
5344ad66-71e9-4ecf-9b87-f3a871ea077e	IwIKs4	2026-03-26	15:00:00	90	Mikroprocesory i mikrokontrolery	dr inż. K. Suchenia	A3	W	wykład	aktywne
0317722b-c2ca-4d4d-8274-5c75379baa25	IwIKs4	2026-03-27	07:30:00	90	Podstawy baz danych	dr inż. J. Strug	A2	W	wykład	aktywne
e90bbfcd-5c9a-41b2-bf50-97aadb882865	IwIKs4	2026-03-27	09:15:00	90	Podstawy baz danych	dr inż. J. Strug	18	P1	laboratoria	aktywne
a84e27b9-47af-4942-b726-4f117a99dea9	IwIKs4	2026-03-27	11:00:00	90	Podstawy baz danych	dr inż. J. Strug	18	P3	laboratoria	aktywne
3ce0deea-dfe7-4ea5-92e4-0d1030c953ef	IwIKs4	2026-03-27	12:45:00	90	Sieci komputerowe	dr inż. P. Król	A2	W	wykład	aktywne
d73d815a-57e1-47c2-a438-33ca306504e8	IwIKs4	2026-03-30	09:15:00	90	Sieci komputerowe	mgr inż. K. Kiełkowicz	A4	W	wykład	aktywne
1c49eada-b821-4041-85cb-3013f995ebc1	IwIKs4	2026-03-30	11:00:00	135	Sieci komputerowe	mgr inż. K. Kiełkowicz	202	L6	laboratoria	aktywne
0ea884c5-5a77-4ffd-9c85-d91a712c61d7	IwIKs4	2026-03-30	11:00:00	135	Mikroprocesory i mikrokontrolery	mgr inż. M. Raźny	208E	L4	laboratoria	aktywne
9d5e9fa0-98c9-4e1a-b416-3fd850d52891	IwIKs4	2026-03-30	13:30:00	135	Sieci komputerowe	mgr inż. K. Kiełkowicz	202	L5	laboratoria	aktywne
7c9e50a6-4b7f-4ff7-a2f4-3e9081d58b1a	IwIKs4	2026-03-30	14:30:00	90	Mikroprocesory i mikrokontrolery	dr inż. S. Żaba	06	L6	laboratoria	aktywne
0539b4a9-7a1c-4525-832d-f1adb61b9a25	IwIKs4	2026-03-30	16:15:00	90	Mikroprocesory i mikrokontrolery	dr inż. S. Żaba	06	L5	laboratoria	aktywne
bbfd2575-2a87-4988-a7e7-ac5e73a839c7	IwIKs4	2026-03-31	07:30:00	90	Podstawy baz danych	dr inż. J. Strug	19	Lk1	laboratoria	aktywne
c283a81e-4371-4f43-8378-a76e39f3b569	IwIKs4	2026-03-31	07:30:00	90	Programowanie technik pomiarowych	dr inż. M. Pawlik	201	Lk2	laboratoria	aktywne
1b6496d6-30b3-4893-9fc9-b1a143c22f71	IwIKs4	2026-03-31	09:15:00	90	Podstawy baz danych	dr inż. J. Strug	19	Lk2	laboratoria	aktywne
ceaab25b-429b-4f3b-bc02-c068d0f204ef	IwIKs4	2026-03-31	09:15:00	90	Programowanie technik pomiarowych	dr inż. M. Pawlik	201	Lk3	laboratoria	aktywne
9e41c175-6a26-41a5-b109-49cbcce544ff	IwIKs4	2026-03-31	11:00:00	90	Podstawy baz danych	dr inż. J. Strug	19	Lk3	laboratoria	aktywne
c5038d1a-0cc9-4134-9f75-33e7983c10da	IwIKs4	2026-03-31	11:00:00	90	Programowanie technik pomiarowych	dr inż. M. Pawlik	201	Lk4	laboratoria	aktywne
d69e2e10-5bfd-4f9e-9236-a71d7c9569ca	IwIKs4	2026-03-31	12:45:00	90	Podstawy baz danych	dr inż. J. Strug	19	Lk4	laboratoria	aktywne
bf3dfa2b-bc81-45c0-992e-c7be63cdf878	IwIKs4	2026-03-31	12:45:00	90	Programowanie technik pomiarowych	dr inż. M. Pawlik	201	Lk1	laboratoria	aktywne
14721bf0-bf66-4077-b732-ef802b5b1152	IwIKs4	2026-03-31	14:30:00	90	Programowanie w języku JAVA	dr inż. S. Bąk	A3	W	wykład	aktywne
31e2032f-2c31-4267-acc2-2a6d875837e7	IwIKs4	2026-03-31	16:15:00	90	Programowanie w języku JAVA	dr inż. S. Bąk	201	Lk1	laboratoria	aktywne
0b7d6575-6b27-4716-abee-541ccd15c8f7	IwIKs4	2026-03-31	18:00:00	90	Programowanie w języku JAVA	dr inż. S. Bąk	201	P3	laboratoria	aktywne
65fcb827-16f2-4cef-a676-3c50edd63f26	IwIKs4	2026-03-31	19:45:00	90	Programowanie w języku JAVA	dr inż. S. Bąk	201	P1	laboratoria	aktywne
d0d35a0c-3d6f-4ecc-9c86-edc6c2f15910	IwIKs4	2026-04-01	07:00:00	900	Przerwa świąteczna	Brak	-	Wszystkie grupy	święto	wolne
74935d4a-e3e1-4c10-bf6f-47b2db2d64b3	IwIKs4	2026-04-02	07:00:00	900	Przerwa świąteczna	Brak	-	Wszystkie grupy	święto	wolne
3a7720b4-7ba3-4106-86ee-9e429cffc71d	IwIKs4	2026-04-03	07:00:00	900	Przerwa świąteczna	Brak	-	Wszystkie grupy	święto	wolne
9f4015f7-8688-4752-973a-5199cd23430e	IwIKs4	2026-04-04	07:00:00	900	Przerwa świąteczna	Brak	-	Wszystkie grupy	święto	wolne
ba443a32-715b-4e45-8a45-d6ad6b3fe9b1	IwIKs4	2026-04-05	07:00:00	900	Przerwa świąteczna	Brak	-	Wszystkie grupy	święto	wolne
e637cd8b-8786-4b9d-8ba1-a2e6263db79a	IwIKs4	2026-04-06	07:00:00	900	Przerwa świąteczna	Brak	-	Wszystkie grupy	święto	wolne
7c62f062-434d-4713-9cc6-f2ea6483aff4	IwIKs4	2026-04-07	07:00:00	900	Przerwa świąteczna	Brak	-	Wszystkie grupy	święto	wolne
4d652b26-7444-4466-b671-c9627e4b0f85	IwIKs4	2026-04-08	09:15:00	90	Język angielski	mgr A. Gunia-Tracz	108D	Lek3	laboratoria	aktywne
5559f8df-e3ab-4ada-b3bc-84d2870cf73c	IwIKs4	2026-04-08	11:00:00	90	Język angielski	mgr A. Gunia-Tracz	108D	Lek2	laboratoria	aktywne
697fbb5b-f8c1-4ec2-baea-457f8542b1c2	IwIKs4	2026-04-08	12:45:00	90	Język angielski	mgr A. Gunia-Tracz	108D	Lek1	laboratoria	aktywne
65ab60d6-85a3-4ccf-9112-bf4cede2e63c	IwIKs4	2026-04-08	14:30:00	90	Programowanie technik pomiarowych	dr inż. M. Pawlik	A3	W	wykład	aktywne
b5eb73cb-4983-41b7-9fd5-c1f6138d9b3f	IwIKs4	2026-04-08	16:15:00	90	Programowanie w języku JAVA	dr inż. S. Bąk	201	Lk2	laboratoria	aktywne
a9c67303-8086-4f36-9976-9c2b12599cf9	IwIKs4	2026-04-08	18:00:00	90	Programowanie w języku JAVA	dr inż. S. Bąk	201	Lk3	laboratoria	aktywne
8f762d47-21db-4fbd-93ae-6f31f70fa60b	IwIKs4	2026-04-08	19:45:00	90	Programowanie w języku JAVA	dr inż. S. Bąk	201	Lk4	laboratoria	aktywne
5345cc1c-ec5d-45e2-acb8-f52c8761ea92	IwIKs4	2026-04-09	07:30:00	135	Sieci komputerowe	mgr inż. G. Nowakowski	202	L3	laboratoria	aktywne
89aa12a0-04be-4717-9a48-3f7ba9bd016b	IwIKs4	2026-04-09	07:30:00	135	Mikroprocesory i mikrokontrolery	dr inż. A. Drwal	06	L1	laboratoria	aktywne
e44d34ad-79f7-496a-929b-d6868fca2c49	IwIKs4	2026-04-09	10:00:00	135	Sieci komputerowe	mgr inż. G. Nowakowski	202	L2	laboratoria	aktywne
53502a3f-e2d0-44c9-a992-47637bf62478	IwIKs4	2026-04-09	10:00:00	135	Sieci komputerowe	dr inż. P. Król	19	L1	laboratoria	aktywne
702ee1dc-5db1-4a24-88d1-23ce052df073	IwIKs4	2026-04-09	10:00:00	135	Mikroprocesory i mikrokontrolery	dr inż. K. Suchenia	101B	L3	laboratoria	aktywne
115fa1bd-7eb0-4eb8-823c-5b641c8211ae	IwIKs4	2026-04-09	12:30:00	135	Sieci komputerowe	mgr inż. G. Nowakowski	202	L4	laboratoria	aktywne
eeb66312-b31b-4ec9-8bc7-c7f90a4053c6	IwIKs4	2026-04-09	12:30:00	135	Mikroprocesory i mikrokontrolery	dr inż. K. Suchenia	101B	L2	laboratoria	aktywne
1278c9ef-0ac1-43d6-a0f0-088c17f8d1ad	IwIKs4	2026-04-09	15:00:00	90	Mikroprocesory i mikrokontrolery	dr inż. K. Suchenia	A3	W	wykład	aktywne
598b0fe9-9e2b-40b9-8f8a-7e01cfc1fa5e	IwIKs4	2026-04-10	07:30:00	90	Podstawy baz danych	dr inż. J. Strug	A2	W	wykład	aktywne
4104458a-2fa7-4ca1-aa37-0a63eb83e044	IwIKs4	2026-04-10	09:15:00	90	Podstawy baz danych	dr inż. J. Strug	18	P1	laboratoria	aktywne
4d519a08-252b-4025-ae7f-cda4cbe5b1f9	IwIKs4	2026-04-10	11:00:00	90	Podstawy baz danych	dr inż. J. Strug	18	P3	laboratoria	aktywne
e93a4e98-391b-48cc-9257-10ae1c4d28e2	IwIKs4	2026-04-10	12:45:00	90	Sieci komputerowe	dr inż. P. Król	A2	W	wykład	aktywne
0a4f01f0-672d-4898-918d-e3c8c88c471b	IwIKs4	2026-04-13	09:15:00	90	Sieci komputerowe	mgr inż. K. Kiełkowicz	A4	W	wykład	aktywne
7a339a0e-2008-4878-9760-12ac2e0cf33f	IwIKs4	2026-04-13	11:00:00	135	Sieci komputerowe	mgr inż. K. Kiełkowicz	202	L6	laboratoria	aktywne
111610a3-9ddf-4567-b66a-67fea665e115	IwIKs4	2026-04-13	11:00:00	135	Mikroprocesory i mikrokontrolery	mgr inż. M. Raźny	208E	L4	laboratoria	aktywne
54f33a19-f517-4164-9d83-2fb60f5dbee7	IwIKs4	2026-04-13	13:30:00	135	Sieci komputerowe	mgr inż. K. Kiełkowicz	202	L5	laboratoria	aktywne
7606938e-08bd-4dda-8110-126a04697b9b	IwIKs4	2026-04-13	14:30:00	90	Mikroprocesory i mikrokontrolery	dr inż. S. Żaba	06	L6	laboratoria	aktywne
7d4f11ad-1ab7-4e20-92a8-13aab720257c	IwIKs4	2026-04-13	16:15:00	90	Mikroprocesory i mikrokontrolery	dr inż. S. Żaba	06	L5	laboratoria	aktywne
31a09522-2b35-4d70-a43b-4671eeb2de61	IwIKs4	2026-04-14	07:30:00	90	Podstawy baz danych	dr inż. J. Strug	19	Lk1	laboratoria	aktywne
f90dc9e4-f1e7-48c9-aab2-df967479bf31	IwIKs4	2026-04-14	07:30:00	90	Programowanie technik pomiarowych	dr inż. M. Pawlik	201	Lk2	laboratoria	aktywne
5d40b4a0-6c9e-478f-85ad-8c2ab57982be	IwIKs4	2026-04-14	09:15:00	90	Podstawy baz danych	dr inż. J. Strug	19	Lk2	laboratoria	aktywne
5fbacd71-1f91-490b-9a9f-ee9a55ff4f49	IwIKs4	2026-04-14	09:15:00	90	Programowanie technik pomiarowych	dr inż. M. Pawlik	201	Lk3	laboratoria	aktywne
cf749f6b-eee8-415b-a9b5-37167674dcfa	IwIKs4	2026-04-14	11:00:00	90	Podstawy baz danych	dr inż. J. Strug	19	Lk3	laboratoria	aktywne
44c7235f-c55f-4949-bcbb-f1e90b3d8219	IwIKs4	2026-04-14	11:00:00	90	Programowanie technik pomiarowych	dr inż. M. Pawlik	201	Lk4	laboratoria	aktywne
be3b8520-e8c9-4a3a-9003-9f12583ebae3	IwIKs4	2026-04-14	12:45:00	90	Podstawy baz danych	dr inż. J. Strug	19	Lk4	laboratoria	aktywne
1e9423e6-979a-440c-b71e-c13ae7becb84	IwIKs4	2026-04-14	12:45:00	90	Programowanie technik pomiarowych	dr inż. M. Pawlik	201	Lk1	laboratoria	aktywne
56bb4655-2b66-4b86-a143-260ffb657bc5	IwIKs4	2026-04-14	14:30:00	90	Programowanie w języku JAVA	dr inż. S. Bąk	A3	W	wykład	aktywne
579a5cf9-4aee-4a3b-a62e-51f08c7daaf6	IwIKs4	2026-04-14	16:15:00	90	Programowanie w języku JAVA	dr inż. S. Bąk	201	Lk1	laboratoria	aktywne
dd1839ee-98c7-4223-b00b-3ab60bc5c3a8	IwIKs4	2026-04-14	18:00:00	90	Programowanie w języku JAVA	dr inż. S. Bąk	201	P3	laboratoria	aktywne
69010d26-0899-4341-8900-ae0de4802361	IwIKs4	2026-04-14	19:45:00	90	Programowanie w języku JAVA	dr inż. S. Bąk	201	P1	laboratoria	aktywne
421079dc-ce06-4650-bcad-ab0ed2776e95	IwIKs4	2026-04-15	09:15:00	90	Język angielski	mgr A. Gunia-Tracz	108D	Lek3	laboratoria	aktywne
5a9799a0-b311-4ea4-97ef-1ac588ac9441	IwIKs4	2026-04-15	11:00:00	90	Język angielski	mgr A. Gunia-Tracz	108D	Lek2	laboratoria	aktywne
f31d4ee5-7b93-4d4d-a691-bf4f6f208a55	IwIKs4	2026-04-15	12:45:00	90	Język angielski	mgr A. Gunia-Tracz	108D	Lek1	laboratoria	aktywne
c34ae881-2fd1-48cf-90c8-7bbb82cb9d3f	IwIKs4	2026-04-15	14:30:00	90	Programowanie technik pomiarowych	dr inż. M. Pawlik	A3	W	wykład	aktywne
c0cf78ba-84bf-4a33-b9ad-5555eada75e9	IwIKs4	2026-04-15	16:15:00	90	Programowanie w języku JAVA	dr inż. S. Bąk	201	Lk2	laboratoria	aktywne
60eca8aa-f687-4d05-8818-21f90af3d78f	IwIKs4	2026-04-15	18:00:00	90	Programowanie w języku JAVA	dr inż. S. Bąk	201	Lk3	laboratoria	aktywne
fe809e02-c961-47f7-bc42-6a5a76c7d052	IwIKs4	2026-04-15	19:45:00	90	Programowanie w języku JAVA	dr inż. S. Bąk	201	Lk4	laboratoria	aktywne
bbe7c9fc-4999-4f7d-ad33-69f6d5d42dac	IwIKs4	2026-04-16	07:30:00	135	Sieci komputerowe	mgr inż. G. Nowakowski	202	L3	laboratoria	aktywne
ad11b4ac-7ba3-46cf-973a-a8d1595a087b	IwIKs4	2026-04-16	07:30:00	135	Mikroprocesory i mikrokontrolery	dr inż. A. Drwal	06	L1	laboratoria	aktywne
6f208289-21aa-4177-a71e-ef86fee09433	IwIKs4	2026-04-16	10:00:00	135	Sieci komputerowe	mgr inż. G. Nowakowski	202	L2	laboratoria	aktywne
a5473879-94b6-4726-96fc-2888401dc162	IwIKs4	2026-04-16	10:00:00	135	Sieci komputerowe	dr inż. P. Król	19	L1	laboratoria	aktywne
6ac7d285-7a6c-4ad3-b0bd-ecefdc4037ee	IwIKs4	2026-04-16	10:00:00	135	Mikroprocesory i mikrokontrolery	dr inż. K. Suchenia	101B	L3	laboratoria	aktywne
fededf32-ae66-475d-b3e5-17384fcedc0c	IwIKs4	2026-04-16	12:30:00	135	Sieci komputerowe	mgr inż. G. Nowakowski	202	L4	laboratoria	aktywne
163fd24c-52a1-4b24-90ee-6e9a14240fa2	IwIKs4	2026-04-16	12:30:00	135	Mikroprocesory i mikrokontrolery	dr inż. K. Suchenia	101B	L2	laboratoria	aktywne
6a94c799-c034-47c4-8f15-abf4776dc005	IwIKs4	2026-04-16	15:00:00	90	Mikroprocesory i mikrokontrolery	dr inż. K. Suchenia	A3	W	wykład	aktywne
b05ef5e4-ca7c-4ead-97ff-6ad1eb42373a	IwIKs4	2026-04-17	07:30:00	90	Podstawy baz danych	dr inż. J. Strug	A2	W	wykład	aktywne
a09a31ed-6fed-46b2-ace6-2236b8a2f542	IwIKs4	2026-04-17	09:15:00	90	Podstawy baz danych	dr inż. J. Strug	18	P2	laboratoria	aktywne
3eadb35e-fc40-4e10-b38b-74ae8e4aca84	IwIKs4	2026-04-17	11:00:00	90	Podstawy baz danych	dr inż. J. Strug	18	P4	laboratoria	aktywne
7b11c7f5-d2c7-4022-8cbb-41b7271c3952	IwIKs4	2026-04-17	12:45:00	90	Sieci komputerowe	dr inż. P. Król	A2	W	wykład	aktywne
64692781-2302-4e07-96c2-c4e411e20632	IwIKs4	2026-04-20	09:15:00	90	Sieci komputerowe	mgr inż. K. Kiełkowicz	A4	W	wykład	aktywne
d25629aa-9309-4d10-b579-0b7bed0bf684	IwIKs4	2026-04-20	11:00:00	135	Sieci komputerowe	mgr inż. K. Kiełkowicz	202	L6	laboratoria	aktywne
f6a0f9fd-55c3-476a-abd3-b413e9f401e8	IwIKs4	2026-04-20	11:00:00	135	Mikroprocesory i mikrokontrolery	mgr inż. M. Raźny	208E	L4	laboratoria	aktywne
54896f60-1eb4-434b-9909-a9f021cd445b	IwIKs4	2026-04-20	13:30:00	135	Sieci komputerowe	mgr inż. K. Kiełkowicz	202	L5	laboratoria	aktywne
9e304a67-95ae-48a4-83ca-78478f8e0303	IwIKs4	2026-04-20	14:30:00	90	Mikroprocesory i mikrokontrolery	dr inż. S. Żaba	06	L6	laboratoria	aktywne
38e29090-614a-4326-bf2b-0bbcae0b4a66	IwIKs4	2026-04-20	16:15:00	90	Mikroprocesory i mikrokontrolery	dr inż. S. Żaba	06	L5	laboratoria	aktywne
5573a6ba-7c06-4a3f-8f8d-6bae3f699d78	IwIKs4	2026-04-20	18:00:00	90	Mikroprocesory i mikrokontrolery	dr inż. S. Żaba	06	P4	laboratoria	aktywne
1df9f9e7-8247-4738-a7d5-ebffda31b1a3	IwIKs4	2026-04-21	07:30:00	90	Podstawy baz danych	dr inż. J. Strug	19	Lk1	laboratoria	aktywne
4f47b933-5a1a-47be-9ead-16279e096b93	IwIKs4	2026-04-21	07:30:00	90	Programowanie technik pomiarowych	dr inż. M. Pawlik	201	Lk2	laboratoria	aktywne
8ce15b48-dc45-46c7-9af6-abc3729cb252	IwIKs4	2026-04-21	09:15:00	90	Podstawy baz danych	dr inż. J. Strug	19	Lk2	laboratoria	aktywne
d045bf73-6874-4640-812e-ce0f174f94ef	IwIKs4	2026-04-21	09:15:00	90	Programowanie technik pomiarowych	dr inż. M. Pawlik	201	Lk3	laboratoria	aktywne
0596275f-14fa-4759-9b8f-53c643651553	IwIKs4	2026-04-21	11:00:00	90	Podstawy baz danych	dr inż. J. Strug	19	Lk3	laboratoria	aktywne
84757928-03b1-41cc-a006-79afea52981c	IwIKs4	2026-04-21	11:00:00	90	Programowanie technik pomiarowych	dr inż. M. Pawlik	201	Lk4	laboratoria	aktywne
bf46a476-0b46-4e7f-b5db-5c81a24fe593	IwIKs4	2026-04-21	12:45:00	90	Podstawy baz danych	dr inż. J. Strug	19	Lk4	laboratoria	aktywne
8ca894a1-5475-4713-86cd-98c0871e7fa7	IwIKs4	2026-04-21	12:45:00	90	Programowanie technik pomiarowych	dr inż. M. Pawlik	201	Lk1	laboratoria	aktywne
2dd8e641-1b4a-4bdc-80a1-7bb778177106	IwIKs4	2026-04-21	14:30:00	90	Programowanie w języku JAVA	dr inż. S. Bąk	A3	W	wykład	aktywne
c0b3cf36-1eac-43da-97c6-482a7f150e15	IwIKs4	2026-04-21	16:15:00	90	Programowanie w języku JAVA	dr inż. S. Bąk	201	Lk1	laboratoria	aktywne
65cba605-4437-47e4-bc65-b948f593839e	IwIKs4	2026-04-21	18:00:00	90	Programowanie w języku JAVA	dr inż. S. Bąk	201	P4	laboratoria	aktywne
2d18d765-2662-4771-8c0a-9dbb8b8551ff	IwIKs4	2026-04-21	19:45:00	90	Programowanie w języku JAVA	dr inż. S. Bąk	201	P2	laboratoria	aktywne
06bafa83-edb1-4a99-a8a8-a1e96ebef81d	IwIKs4	2026-04-22	09:15:00	90	Język angielski	mgr A. Gunia-Tracz	108D	Lek3	laboratoria	aktywne
7556141d-2224-4e9b-8b5c-df3815e73693	IwIKs4	2026-04-22	11:00:00	90	Język angielski	mgr A. Gunia-Tracz	108D	Lek2	laboratoria	aktywne
5931126d-fe05-413d-bc0e-2166a0243430	IwIKs4	2026-04-22	12:45:00	90	Język angielski	mgr A. Gunia-Tracz	108D	Lek1	laboratoria	aktywne
4c43f884-adef-4571-ac3c-90abf5560f75	IwIKs4	2026-04-22	14:30:00	90	Programowanie technik pomiarowych	dr inż. M. Pawlik	A3	W	wykład	aktywne
5662f228-a4a0-4d8e-8733-dceab935256a	IwIKs4	2026-04-22	16:15:00	90	Programowanie w języku JAVA	dr inż. S. Bąk	201	Lk2	laboratoria	aktywne
e7e5b94f-7cb1-4d0c-a14d-31392ed2e002	IwIKs4	2026-04-22	18:00:00	90	Programowanie w języku JAVA	dr inż. S. Bąk	201	Lk3	laboratoria	aktywne
fadf9e5d-bed4-4f5c-93ea-738b5e5e2cc9	IwIKs4	2026-04-22	19:45:00	90	Programowanie w języku JAVA	dr inż. S. Bąk	201	Lk4	laboratoria	aktywne
2076141e-8bbf-4e0e-8c02-ddee091f01b6	IwIKs4	2026-04-23	07:30:00	135	Sieci komputerowe	mgr inż. G. Nowakowski	202	L3	laboratoria	aktywne
ca7203ae-7af3-4055-a116-8da725c046ca	IwIKs4	2026-04-23	07:30:00	135	Mikroprocesory i mikrokontrolery	dr inż. A. Drwal	06	L1	laboratoria	aktywne
4ee72ce6-147f-463d-a7eb-5e650ac60ed5	IwIKs4	2026-04-23	10:00:00	135	Sieci komputerowe	mgr inż. G. Nowakowski	202	L2	laboratoria	aktywne
b4bb1126-f56b-49a4-977e-c0df44ea25dc	IwIKs4	2026-04-23	10:00:00	135	Sieci komputerowe	dr inż. P. Król	19	L1	laboratoria	aktywne
72eb4516-9dd9-4f68-bd01-83d30fc9697d	IwIKs4	2026-04-23	10:00:00	135	Mikroprocesory i mikrokontrolery	dr inż. K. Suchenia	101B	L3	laboratoria	aktywne
169309ba-2906-4047-b8c7-73028df86d1a	IwIKs4	2026-04-23	12:30:00	135	Sieci komputerowe	mgr inż. G. Nowakowski	202	L4	laboratoria	aktywne
c56fe126-c48b-471a-9bdf-8bb79bb123f4	IwIKs4	2026-04-23	12:30:00	135	Mikroprocesory i mikrokontrolery	dr inż. K. Suchenia	101B	L2	laboratoria	aktywne
8e32b254-35a8-4a9f-a21e-944353b5b8bb	IwIKs4	2026-04-23	15:00:00	90	Mikroprocesory i mikrokontrolery	dr inż. K. Suchenia	A3	W	wykład	aktywne
67738584-96bb-4fb6-8a6d-02b7cb7d54b0	IwIKs4	2026-04-24	07:30:00	90	Podstawy baz danych	dr inż. J. Strug	A2	W	wykład	aktywne
989603be-efd9-4b52-ab46-aab0ffb3b7ca	IwIKs4	2026-04-24	09:15:00	90	Podstawy baz danych	dr inż. J. Strug	18	P1	laboratoria	aktywne
13f2505e-dbfa-40a4-bd02-b5994159ad55	IwIKs4	2026-04-24	11:00:00	90	Podstawy baz danych	dr inż. J. Strug	18	P3	laboratoria	aktywne
0e964b81-d468-458b-b2a8-52ee7dc9a2fd	IwIKs4	2026-04-24	12:45:00	90	Sieci komputerowe	dr inż. P. Król	A2	W	wykład	aktywne
db3ccee2-a266-4cc1-a009-0c12ac049cbd	IwIKs4	2026-04-27	09:15:00	90	Sieci komputerowe	mgr inż. K. Kiełkowicz	A4	W	wykład	aktywne
503d83e8-f31f-4ce4-9c50-de93d299742b	IwIKs4	2026-04-27	11:00:00	135	Sieci komputerowe	mgr inż. K. Kiełkowicz	202	L6	laboratoria	aktywne
1dfbb447-a249-4213-85eb-067686b6d442	IwIKs4	2026-04-27	11:00:00	135	Mikroprocesory i mikrokontrolery	mgr inż. M. Raźny	208E	L4	laboratoria	aktywne
b0348c64-5228-4e7a-9592-3ee28de5bff3	IwIKs4	2026-04-27	13:30:00	135	Sieci komputerowe	mgr inż. K. Kiełkowicz	202	L5	laboratoria	aktywne
03c62dce-1065-4567-aabb-214a4625e8d5	IwIKs4	2026-04-27	14:30:00	90	Mikroprocesory i mikrokontrolery	dr inż. S. Żaba	06	L6	laboratoria	aktywne
ab8c1af6-dcb3-4053-b71d-a6ffe71ac2ce	IwIKs4	2026-04-27	16:15:00	90	Mikroprocesory i mikrokontrolery	dr inż. S. Żaba	06	L5	laboratoria	aktywne
5f2482fa-1e28-4090-a51c-932dd462b6e0	IwIKs4	2026-04-28	07:30:00	90	Podstawy baz danych	dr inż. J. Strug	19	Lk1	laboratoria	aktywne
8891a7d4-3dba-4aaf-ad5e-2267e079872d	IwIKs4	2026-04-28	07:30:00	90	Programowanie technik pomiarowych	dr inż. M. Pawlik	201	Lk2	laboratoria	aktywne
a3d84547-9e39-4ae1-99c4-cb58a6fb54d0	IwIKs4	2026-04-28	09:15:00	90	Podstawy baz danych	dr inż. J. Strug	19	Lk2	laboratoria	aktywne
eca3da87-7516-40d6-98f1-d227d31d5894	IwIKs4	2026-04-28	09:15:00	90	Programowanie technik pomiarowych	dr inż. M. Pawlik	201	Lk3	laboratoria	aktywne
dfefab2b-66da-4444-8372-75433d6601e4	IwIKs4	2026-04-28	11:00:00	90	Podstawy baz danych	dr inż. J. Strug	19	Lk3	laboratoria	aktywne
38e28ddb-2b02-4344-9485-ad29366e5fe1	IwIKs4	2026-04-28	11:00:00	90	Programowanie technik pomiarowych	dr inż. M. Pawlik	201	Lk4	laboratoria	aktywne
d32edb77-24d4-49d2-ad1b-b81347b4721c	IwIKs4	2026-04-28	12:45:00	90	Podstawy baz danych	dr inż. J. Strug	19	Lk4	laboratoria	aktywne
4ecfe347-41ee-4546-9640-6c4f396e61bc	IwIKs4	2026-04-28	12:45:00	90	Programowanie technik pomiarowych	dr inż. M. Pawlik	201	Lk1	laboratoria	aktywne
abbd8a6f-c903-4eb5-8b44-4ccb39a972a0	IwIKs4	2026-04-28	14:30:00	90	Programowanie w języku JAVA	dr inż. S. Bąk	A3	W	wykład	aktywne
7b9b17cc-6136-4e32-a069-a7898f5d05ae	IwIKs4	2026-04-28	16:15:00	90	Programowanie w języku JAVA	dr inż. S. Bąk	201	Lk1	laboratoria	aktywne
1befedf1-98d6-4403-aacf-5904d8865b2e	IwIKs4	2026-04-28	18:00:00	90	Programowanie w języku JAVA	dr inż. S. Bąk	201	P3	laboratoria	aktywne
dac21471-d93b-468b-a21a-66c59cb07208	IwIKs4	2026-04-28	19:45:00	90	Programowanie w języku JAVA	dr inż. S. Bąk	201	P1	laboratoria	aktywne
78cdf1fa-bed9-453d-b079-96c18580df11	IwIKs4	2026-04-29	09:15:00	90	Język angielski	mgr A. Gunia-Tracz	108D	Lek3	laboratoria	aktywne
60d6e08c-506a-4898-bc35-0e89b854f2d5	IwIKs4	2026-04-29	11:00:00	90	Język angielski	mgr A. Gunia-Tracz	108D	Lek2	laboratoria	aktywne
22db8d2e-a52f-4b8e-8012-15579e771bd2	IwIKs4	2026-04-29	12:45:00	90	Język angielski	mgr A. Gunia-Tracz	108D	Lek1	laboratoria	aktywne
235b204b-1edd-476f-bd21-74a169b9298e	IwIKs4	2026-04-29	14:30:00	90	Programowanie technik pomiarowych	dr inż. M. Pawlik	A3	W	wykład	aktywne
1701b476-f3df-41d5-9a54-3edff8eeb47c	IwIKs4	2026-04-29	16:15:00	90	Programowanie w języku JAVA	dr inż. S. Bąk	201	Lk2	laboratoria	aktywne
ce2c7b78-54ba-48c4-8a6c-cc04fe6c6da7	IwIKs4	2026-04-29	18:00:00	90	Programowanie w języku JAVA	dr inż. S. Bąk	201	Lk3	laboratoria	aktywne
e1d8d358-309d-4354-ae6d-7a6c7b934617	IwIKs4	2026-04-29	19:45:00	90	Programowanie w języku JAVA	dr inż. S. Bąk	201	Lk4	laboratoria	aktywne
f7e13c09-7f7c-4093-abce-6e31a502f73d	IwIKs4	2026-04-30	07:30:00	135	Sieci komputerowe	mgr inż. G. Nowakowski	202	L3	laboratoria	aktywne
36c21160-8c51-4392-81cb-56ca2a0df5da	IwIKs4	2026-04-30	07:30:00	135	Mikroprocesory i mikrokontrolery	dr inż. A. Drwal	06	L1	laboratoria	aktywne
beb92c4e-6704-4827-90f8-0cd14edde6e9	IwIKs4	2026-04-30	10:00:00	135	Sieci komputerowe	mgr inż. G. Nowakowski	202	L2	laboratoria	aktywne
10e19381-9126-4c3b-b7f6-8fa92e6e7209	IwIKs4	2026-04-30	10:00:00	135	Sieci komputerowe	dr inż. P. Król	19	L1	laboratoria	aktywne
03f4ce8d-593b-4aba-ac11-d1a13d4f54a3	IwIKs4	2026-04-30	10:00:00	135	Mikroprocesory i mikrokontrolery	dr inż. K. Suchenia	101B	L3	laboratoria	aktywne
a44f5d42-863d-4f86-8a8e-4e1344f06a1c	IwIKs4	2026-04-30	12:30:00	135	Sieci komputerowe	mgr inż. G. Nowakowski	202	L4	laboratoria	aktywne
3b84b546-66f5-4939-ab2d-e3e240585e7c	IwIKs4	2026-04-30	12:30:00	135	Mikroprocesory i mikrokontrolery	dr inż. K. Suchenia	101B	L2	laboratoria	aktywne
347c968c-afd6-4287-9bd2-5d407358e057	IwIKs4	2026-04-30	15:00:00	90	Mikroprocesory i mikrokontrolery	dr inż. K. Suchenia	A3	W	wykład	aktywne
882aa986-5c30-4cac-8b16-168967aed418	IwIKs4	2026-05-01	07:00:00	900	Majówka	Brak	-	Wszystkie grupy	święto	wolne
d39c4dff-d4c5-4074-aeae-4e0c49876cdc	IwIKs4	2026-05-02	07:00:00	900	Majówka	Brak	-	Wszystkie grupy	święto	wolne
1fc7506d-9606-451d-829b-0aed4db54cca	IwIKs4	2026-05-03	07:00:00	900	Majówka	Brak	-	Wszystkie grupy	święto	wolne
b60705c2-9fc1-477b-81db-835b847d0685	IwIKs4	2026-05-04	07:00:00	900	Majówka	Brak	-	Wszystkie grupy	święto	wolne
6cbdc079-ae25-4497-b094-4f15773ec1b3	IwIKs4	2026-05-05	07:30:00	90	Podstawy baz danych	dr inż. J. Strug	19	Lk1	laboratoria	aktywne
620d37d7-fea0-4b9e-a400-bd98a80fab3b	IwIKs4	2026-05-05	07:30:00	90	Programowanie technik pomiarowych	dr inż. M. Pawlik	201	Lk2	laboratoria	aktywne
c4458a81-78fe-4bd9-bedd-57389b74598d	IwIKs4	2026-05-05	09:15:00	90	Podstawy baz danych	dr inż. J. Strug	19	Lk2	laboratoria	aktywne
2acb684d-99b9-44ce-91c0-a2a74ac3022e	IwIKs4	2026-05-05	09:15:00	90	Programowanie technik pomiarowych	dr inż. M. Pawlik	201	Lk3	laboratoria	aktywne
16510084-deaf-4691-b6f1-39e9b073e648	IwIKs4	2026-05-05	11:00:00	90	Podstawy baz danych	dr inż. J. Strug	19	Lk3	laboratoria	aktywne
b7dcf78e-24eb-453d-8f39-bd895e51173c	IwIKs4	2026-05-05	11:00:00	90	Programowanie technik pomiarowych	dr inż. M. Pawlik	201	Lk4	laboratoria	aktywne
35c9ebdd-0c3f-421e-858d-06ededd83572	IwIKs4	2026-05-05	12:45:00	90	Podstawy baz danych	dr inż. J. Strug	19	Lk4	laboratoria	aktywne
00f3d952-16e7-4f6b-8047-8f40007464f2	IwIKs4	2026-05-05	12:45:00	90	Programowanie technik pomiarowych	dr inż. M. Pawlik	201	Lk1	laboratoria	aktywne
8d4fee12-5053-4350-a6f9-5a7514378237	IwIKs4	2026-05-05	14:30:00	90	Programowanie w języku JAVA	dr inż. S. Bąk	A3	W	wykład	aktywne
bd269742-59d7-4f53-9a8b-92ff9cb2d0e0	IwIKs4	2026-05-05	16:15:00	90	Programowanie w języku JAVA	dr inż. S. Bąk	201	Lk1	laboratoria	aktywne
658acd34-0f3f-4489-a831-8b819d9b6a09	IwIKs4	2026-05-05	18:00:00	90	Programowanie w języku JAVA	dr inż. S. Bąk	201	P4	laboratoria	aktywne
44fbfca5-61de-49dd-b287-5af9faf12cf1	IwIKs4	2026-05-05	19:45:00	90	Programowanie w języku JAVA	dr inż. S. Bąk	201	P2	laboratoria	aktywne
2949564d-d735-40d7-a231-5fa9c14e46cf	IwIKs4	2026-05-06	09:15:00	90	Język angielski	mgr A. Gunia-Tracz	108D	Lek3	laboratoria	aktywne
8891d1b9-85f5-43ec-8d04-42d29d6255ba	IwIKs4	2026-05-06	11:00:00	90	Język angielski	mgr A. Gunia-Tracz	108D	Lek2	laboratoria	aktywne
7c0c5492-734d-4492-8a34-f4f98988deb9	IwIKs4	2026-05-06	12:45:00	90	Język angielski	mgr A. Gunia-Tracz	108D	Lek1	laboratoria	aktywne
46732f1b-a174-4645-ad96-8cdf06dcd27b	IwIKs4	2026-05-06	14:30:00	90	Programowanie technik pomiarowych	dr inż. M. Pawlik	A3	W	wykład	aktywne
f5fbf5a6-900f-4432-8c21-7ad06b7a70a4	IwIKs4	2026-05-06	16:15:00	90	Programowanie w języku JAVA	dr inż. S. Bąk	201	Lk2	laboratoria	aktywne
a840f428-19f1-45dd-b8fd-4ef4e53f72dd	IwIKs4	2026-05-06	18:00:00	90	Programowanie w języku JAVA	dr inż. S. Bąk	201	Lk3	laboratoria	aktywne
06a5dbbe-625e-4e25-a3cc-c02bfdcf7a8b	IwIKs4	2026-05-06	19:45:00	90	Programowanie w języku JAVA	dr inż. S. Bąk	201	Lk4	laboratoria	aktywne
fcc7b259-5489-4687-b9b5-0b7a029816ec	IwIKs4	2026-05-07	07:30:00	135	Sieci komputerowe	mgr inż. G. Nowakowski	202	L3	laboratoria	aktywne
6a82c7d8-9dc5-4618-b230-eeffc68670fb	IwIKs4	2026-05-07	07:30:00	135	Mikroprocesory i mikrokontrolery	dr inż. A. Drwal	06	L1	laboratoria	aktywne
12ffbd82-9cbf-4da4-aa76-1683ff492eb1	IwIKs4	2026-05-07	10:00:00	135	Sieci komputerowe	mgr inż. G. Nowakowski	202	L2	laboratoria	aktywne
903b0b5c-6ab9-4260-be0f-10c0544a9450	IwIKs4	2026-05-07	10:00:00	135	Sieci komputerowe	dr inż. P. Król	19	L1	laboratoria	aktywne
91dff7ef-5a24-4688-83c4-90152dc8b8b7	IwIKs4	2026-05-07	10:00:00	135	Mikroprocesory i mikrokontrolery	dr inż. K. Suchenia	101B	L3	laboratoria	aktywne
a38a21fb-315a-408c-884f-9d68c5016adb	IwIKs4	2026-05-07	12:30:00	135	Sieci komputerowe	mgr inż. G. Nowakowski	202	L4	laboratoria	aktywne
ea043c41-23e0-4578-9841-adc2a60f889e	IwIKs4	2026-05-07	12:30:00	135	Mikroprocesory i mikrokontrolery	dr inż. K. Suchenia	101B	L2	laboratoria	aktywne
18c8e3e9-0019-4142-94e4-75299310b28c	IwIKs4	2026-05-07	15:00:00	90	Mikroprocesory i mikrokontrolery	dr inż. K. Suchenia	A3	W	wykład	aktywne
5b3c6170-d279-41d4-9147-713c649c2acb	IwIKs4	2026-05-08	07:30:00	90	Podstawy baz danych	dr inż. J. Strug	A2	W	wykład	aktywne
e5c75400-0a75-4392-9e5a-26da93cf95d2	IwIKs4	2026-05-08	09:15:00	90	Podstawy baz danych	dr inż. J. Strug	18	P1	laboratoria	aktywne
1172b8cd-fee3-4188-9b67-ab447cf46b82	IwIKs4	2026-05-08	11:00:00	90	Podstawy baz danych	dr inż. J. Strug	18	P3	laboratoria	aktywne
a24acc78-3196-41f3-a69b-00076e0edc52	IwIKs4	2026-05-08	12:45:00	90	Sieci komputerowe	dr inż. P. Król	A2	W	wykład	aktywne
5fa7199c-3b26-46e2-83aa-5ac64a1a9ff1	IwIKs4	2026-05-11	09:15:00	90	Sieci komputerowe	mgr inż. K. Kiełkowicz	A4	W	wykład	aktywne
493a2d9d-2286-4a82-b687-4883c85a97a6	IwIKs4	2026-05-11	11:00:00	135	Sieci komputerowe	mgr inż. K. Kiełkowicz	202	L6	laboratoria	aktywne
a7033f33-5f01-4ac6-81e3-c85d8e2612f5	IwIKs4	2026-05-11	11:00:00	135	Mikroprocesory i mikrokontrolery	mgr inż. M. Raźny	208E	L4	laboratoria	aktywne
88a527b0-bb04-4c35-925d-49151f6a45fb	IwIKs4	2026-05-11	13:30:00	135	Sieci komputerowe	mgr inż. K. Kiełkowicz	202	L5	laboratoria	aktywne
b15c417f-98d8-439f-823f-29cdf53d9e43	IwIKs4	2026-05-11	14:30:00	90	Mikroprocesory i mikrokontrolery	dr inż. S. Żaba	06	L6	laboratoria	aktywne
a822abc3-0783-4ed5-aaf9-b89e0749c6ca	IwIKs4	2026-05-11	16:15:00	90	Mikroprocesory i mikrokontrolery	dr inż. S. Żaba	06	L5	laboratoria	aktywne
180a8f53-91ba-4772-9e4b-6faa5b059494	IwIKs4	2026-05-12	07:00:00	900	Święto Szkoły	Brak	-	Wszystkie grupy	święto	wolne
885d68f2-436d-40be-98cb-c71059f9da1f	IwIKs4	2026-05-13	09:15:00	90	Język angielski	mgr A. Gunia-Tracz	108D	Lek3	laboratoria	aktywne
63394ee4-54de-4a48-9cc2-039c024a4279	IwIKs4	2026-05-13	11:00:00	90	Język angielski	mgr A. Gunia-Tracz	108D	Lek2	laboratoria	aktywne
8abfd332-4c0e-4491-bc38-d841a4af5472	IwIKs4	2026-05-13	12:45:00	90	Język angielski	mgr A. Gunia-Tracz	108D	Lek1	laboratoria	aktywne
36170c5d-fc7e-43bd-bbcb-bbafb5308093	IwIKs4	2026-05-13	14:30:00	90	Programowanie technik pomiarowych	dr inż. M. Pawlik	A3	W	wykład	aktywne
1f6b8446-3c7f-40e2-95f1-780652364960	IwIKs4	2026-05-13	16:15:00	90	Programowanie w języku JAVA	dr inż. S. Bąk	201	Lk2	laboratoria	aktywne
6401e6c6-b181-4686-8efa-9a765d941c6d	IwIKs4	2026-05-13	18:00:00	90	Programowanie w języku JAVA	dr inż. S. Bąk	201	Lk3	laboratoria	aktywne
4aa7acbe-146d-460d-8f32-2c2462147bb0	IwIKs4	2026-05-13	19:45:00	90	Programowanie w języku JAVA	dr inż. S. Bąk	201	Lk4	laboratoria	aktywne
090c4f14-46e6-45f7-bd4d-e4f41ba922a1	IwIKs4	2026-05-14	07:30:00	135	Sieci komputerowe	mgr inż. G. Nowakowski	202	L3	laboratoria	aktywne
94ef3172-f3b2-4ffa-96bf-bdb324b3c386	IwIKs4	2026-05-14	07:30:00	135	Mikroprocesory i mikrokontrolery	dr inż. A. Drwal	06	P1	laboratoria	aktywne
4fffc626-7564-46bb-97c6-eab2ec078b78	IwIKs4	2026-05-14	10:00:00	135	Sieci komputerowe	mgr inż. G. Nowakowski	202	L2	laboratoria	aktywne
6d003efe-5299-48fe-bac5-18e78d0d2954	IwIKs4	2026-05-14	10:00:00	135	Sieci komputerowe	dr inż. P. Król	19	L1	laboratoria	aktywne
ee43b2cb-0f9a-425f-8108-ae9227b580d0	IwIKs4	2026-05-14	12:30:00	135	Sieci komputerowe	mgr inż. G. Nowakowski	202	L4	laboratoria	aktywne
22ba00a2-475c-478d-8160-fec4dfa8a0fd	IwIKs4	2026-05-14	12:30:00	135	Mikroprocesory i mikrokontrolery	dr inż. K. Suchenia	101B	P2	laboratoria	aktywne
f2a71cea-8b15-4763-99c3-17f6df9eb649	IwIKs4	2026-05-15	07:30:00	135	Podstawy baz danych	dr inż. J. Strug	A2	W	wykład	aktywne
317ade8a-7cea-41a8-89cb-cfd40059e7ad	IwIKs4	2026-05-15	10:00:00	135	Podstawy baz danych	dr inż. J. Strug	18	P2	laboratoria	aktywne
1b6f78c5-7859-48d8-b54f-cc8546c49258	IwIKs4	2026-05-15	10:00:00	135	Sieci komputerowe	dr inż. P. Król	19	L1	laboratoria	aktywne
b04c5626-307f-4f30-811d-e585bc99f6dc	IwIKs4	2026-05-15	12:30:00	135	Podstawy baz danych	dr inż. J. Strug	18	P4	laboratoria	aktywne
25c334a3-b8da-497c-b3f6-c2c8efe5f057	IwIKs4	2026-05-18	11:00:00	135	Sieci komputerowe	mgr inż. K. Kiełkowicz	202	L6	laboratoria	aktywne
c5d7ac29-026d-4c44-9681-949e8f8f9e22	IwIKs4	2026-05-18	11:00:00	135	Mikroprocesory i mikrokontrolery	mgr inż. M. Raźny	208E	P3	laboratoria	aktywne
f93de61c-54e6-4048-ba85-f52741b13292	IwIKs4	2026-05-18	13:30:00	135	Sieci komputerowe	mgr inż. K. Kiełkowicz	202	L5	laboratoria	aktywne
f0bb980b-1a19-46d4-b625-31a224a893d4	IwIKs4	2026-05-18	14:30:00	90	Mikroprocesory i mikrokontrolery	dr inż. S. Żaba	06	L6	laboratoria	aktywne
e015e6ef-4008-4bda-8cc9-2570d8ff5a34	IwIKs4	2026-05-18	16:15:00	90	Mikroprocesory i mikrokontrolery	dr inż. S. Żaba	06	L5	laboratoria	aktywne
5c11c830-d263-4665-81f7-6312198bc840	IwIKs4	2026-05-18	18:00:00	90	Mikroprocesory i mikrokontrolery	dr inż. S. Żaba	06	P4	laboratoria	aktywne
77cbd940-ea29-407f-8289-74f70f51e4e0	IwIKs4	2026-05-19	07:30:00	90	Podstawy baz danych	dr inż. J. Strug	19	Lk1	laboratoria	aktywne
381692a7-68ff-4b34-9be2-0d89225bb253	IwIKs4	2026-05-19	07:30:00	90	Programowanie technik pomiarowych	dr inż. M. Pawlik	201	Lk2	laboratoria	aktywne
855502d0-891a-40a4-b919-dd65d4aaf40b	IwIKs4	2026-05-19	09:15:00	90	Podstawy baz danych	dr inż. J. Strug	19	Lk2	laboratoria	aktywne
ab9c7003-07ea-4113-96ad-749fb34de0c8	IwIKs4	2026-05-19	09:15:00	90	Programowanie technik pomiarowych	dr inż. M. Pawlik	201	Lk3	laboratoria	aktywne
446e5df0-e441-42a2-ac23-de009bc546de	IwIKs4	2026-05-19	11:00:00	90	Podstawy baz danych	dr inż. J. Strug	19	Lk3	laboratoria	aktywne
72109544-7db6-47d6-b2ab-96032f9c1a54	IwIKs4	2026-05-19	11:00:00	90	Programowanie technik pomiarowych	dr inż. M. Pawlik	201	Lk4	laboratoria	aktywne
c347362c-942e-4702-a62e-2469148ce864	IwIKs4	2026-05-19	12:45:00	90	Podstawy baz danych	dr inż. J. Strug	19	Lk4	laboratoria	aktywne
a7c80ba3-3641-4fcb-9dba-e795b0ce991e	IwIKs4	2026-05-19	12:45:00	90	Programowanie technik pomiarowych	dr inż. M. Pawlik	201	Lk1	laboratoria	aktywne
c00ab3f5-5ea3-44eb-bd29-2d9512c6c617	IwIKs4	2026-05-19	14:30:00	90	Programowanie w języku JAVA	dr inż. S. Bąk	A3	W	wykład	aktywne
ffe801e4-f8d9-4400-af9a-37ce5a58e41b	IwIKs4	2026-05-19	16:15:00	90	Programowanie w języku JAVA	dr inż. S. Bąk	201	Lk1	laboratoria	aktywne
4688d9c2-092f-4990-bd6b-aa582a022c30	IwIKs4	2026-05-19	18:00:00	90	Programowanie w języku JAVA	dr inż. S. Bąk	201	P4	laboratoria	aktywne
71ded624-9e2f-408b-bf8d-082acf102dae	IwIKs4	2026-05-19	19:45:00	90	Programowanie w języku JAVA	dr inż. S. Bąk	201	P2	laboratoria	aktywne
71cdb3d3-c18b-46eb-9368-06d44cbfd481	IwIKs4	2026-05-20	09:15:00	90	Język angielski	mgr A. Gunia-Tracz	108D	Lek3	laboratoria	aktywne
c73c487f-bd83-4bbf-be06-91e12fec7869	IwIKs4	2026-05-20	11:00:00	90	Język angielski	mgr A. Gunia-Tracz	108D	Lek2	laboratoria	aktywne
256da2fd-62d1-4894-868c-66f737a7fafe	IwIKs4	2026-05-20	12:45:00	90	Język angielski	mgr A. Gunia-Tracz	108D	Lek1	laboratoria	aktywne
349a5db1-a13e-415a-a7c6-78a011ede8ca	IwIKs4	2026-05-20	14:30:00	90	Programowanie technik pomiarowych	dr inż. M. Pawlik	A3	W	wykład	aktywne
09097e63-5999-4f7c-985a-c7c0d7c6025b	IwIKs4	2026-05-20	16:15:00	90	Programowanie w języku JAVA	dr inż. S. Bąk	201	Lk2	laboratoria	aktywne
bcf02319-9588-45af-96bd-e4f99e08a84d	IwIKs4	2026-05-20	18:00:00	90	Programowanie w języku JAVA	dr inż. S. Bąk	201	Lk3	laboratoria	aktywne
bfdd5139-a41d-40d2-b373-fd71d375d3be	IwIKs4	2026-05-20	19:45:00	90	Programowanie w języku JAVA	dr inż. S. Bąk	201	Lk4	laboratoria	aktywne
377323c2-9d6a-4d66-8690-139d2417f9e6	IwIKs4	2026-05-21	07:30:00	135	Sieci komputerowe	mgr inż. G. Nowakowski	202	L3	laboratoria	aktywne
0bb59e0d-6bd2-4eb3-813c-5075dd04a10a	IwIKs4	2026-05-21	07:30:00	135	Mikroprocesory i mikrokontrolery	dr inż. A. Drwal	06	P1	laboratoria	aktywne
1d1f9156-7346-4364-af6c-76842e1208ca	IwIKs4	2026-05-21	10:00:00	135	Sieci komputerowe	mgr inż. G. Nowakowski	202	L2	laboratoria	aktywne
574ef40a-6432-4a2b-a721-34ace1cf0ff4	IwIKs4	2026-05-21	10:00:00	135	Sieci komputerowe	dr inż. P. Król	19	L1	laboratoria	aktywne
6a307815-267f-4fa6-9e8f-6a79fbd05a7d	IwIKs4	2026-05-21	12:30:00	135	Sieci komputerowe	mgr inż. G. Nowakowski	202	L4	laboratoria	aktywne
92db722f-495a-41e1-8764-5c404bf513bd	IwIKs4	2026-05-21	12:30:00	180	Mikroprocesory i mikrokontrolery	dr inż. K. Suchenia	101B	P2	laboratoria	aktywne
8294a331-358b-425a-a5c9-94a538f5fa9a	IwIKs4	2026-05-22	07:30:00	135	Podstawy baz danych	dr inż. J. Strug	A2	W	wykład	aktywne
88bb6789-37ed-40c4-8494-2a683fa8695d	IwIKs4	2026-05-22	10:00:00	135	Podstawy baz danych	dr inż. J. Strug	18	P1	laboratoria	aktywne
066dccaf-0573-44d2-8bd7-fda15a7bdedd	IwIKs4	2026-05-22	12:30:00	135	Podstawy baz danych	dr inż. J. Strug	18	P3	laboratoria	aktywne
97c63f7f-d0eb-48c9-90bb-f672534bb19a	IwIKs4	2026-05-24	07:00:00	900	Zielone Świątki	Brak	-	Wszystkie grupy	święto	wolne
b1a6ed28-e0d6-4001-9541-1fc8584b2569	IwIKs4	2026-05-25	11:00:00	135	Sieci komputerowe	mgr inż. K. Kiełkowicz	202	L6	laboratoria	aktywne
0b2a33d6-ea7d-489d-9523-4965237c186a	IwIKs4	2026-05-25	11:00:00	135	Mikroprocesory i mikrokontrolery	mgr inż. M. Raźny	208E	P3	laboratoria	aktywne
f8117ed1-a4e1-471c-8c8e-042b5a46984a	IwIKs4	2026-05-25	13:30:00	135	Sieci komputerowe	mgr inż. K. Kiełkowicz	202	L5	laboratoria	aktywne
da66bc93-e7e7-4e0e-84d8-4215bdacf1f2	IwIKs4	2026-05-25	14:30:00	90	Mikroprocesory i mikrokontrolery	dr inż. S. Żaba	06	L6	laboratoria	aktywne
fe7394f6-7584-4967-a778-4bb3c6c7d809	IwIKs4	2026-05-25	16:15:00	90	Mikroprocesory i mikrokontrolery	dr inż. S. Żaba	06	L5	laboratoria	aktywne
95305363-a645-48bf-85da-dd6edf11cfe9	IwIKs4	2026-05-26	07:30:00	90	Podstawy baz danych	dr inż. J. Strug	19	Lk1	laboratoria	aktywne
5bc557d5-e138-4e2e-b112-314bf29190ec	IwIKs4	2026-05-26	07:30:00	90	Programowanie technik pomiarowych	dr inż. M. Pawlik	201	Lk2	laboratoria	aktywne
4d6e06cf-4887-441b-b26f-a62259972907	IwIKs4	2026-05-26	09:15:00	90	Podstawy baz danych	dr inż. J. Strug	19	Lk2	laboratoria	aktywne
9263430a-fd08-43b5-9007-3af063c52968	IwIKs4	2026-05-26	09:15:00	90	Programowanie technik pomiarowych	dr inż. M. Pawlik	201	Lk3	laboratoria	aktywne
eb681d3e-a231-4ca6-bf6d-e12e39d03e5b	IwIKs4	2026-05-26	11:00:00	90	Podstawy baz danych	dr inż. J. Strug	19	Lk3	laboratoria	aktywne
a78f51f0-1d33-4022-bb93-91a74080c985	IwIKs4	2026-05-26	11:00:00	90	Programowanie technik pomiarowych	dr inż. M. Pawlik	201	Lk4	laboratoria	aktywne
1b0c0e1d-e8f6-4932-872b-13e36564007c	IwIKs4	2026-05-26	12:45:00	90	Podstawy baz danych	dr inż. J. Strug	19	Lk4	laboratoria	aktywne
cbac4d28-12ca-44fe-b4e5-67285fa49c28	IwIKs4	2026-05-26	12:45:00	90	Programowanie technik pomiarowych	dr inż. M. Pawlik	201	Lk1	laboratoria	aktywne
de2ef378-b41f-4a20-b607-64e9fc74f172	IwIKs4	2026-05-26	14:30:00	90	Programowanie w języku JAVA	dr inż. S. Bąk	A3	W	wykład	aktywne
16c65b56-ff74-49cc-9c8d-99edea9e4243	IwIKs4	2026-05-26	16:15:00	90	Programowanie w języku JAVA	dr inż. S. Bąk	201	Lk1	laboratoria	aktywne
ae0b6025-8d23-4496-bf7b-b8d74986efd3	IwIKs4	2026-05-26	18:00:00	90	Programowanie w języku JAVA	dr inż. S. Bąk	201	P3	laboratoria	aktywne
9370be3a-c292-43e7-809c-398852852f04	IwIKs4	2026-05-26	19:45:00	90	Programowanie w języku JAVA	dr inż. S. Bąk	201	P1	laboratoria	aktywne
d0424bc3-b88c-4306-b731-5f993226961c	IwIKs4	2026-05-27	09:15:00	90	Język angielski	mgr A. Gunia-Tracz	108D	Lek3	laboratoria	aktywne
58711406-9241-41eb-8d90-5886df185d7d	IwIKs4	2026-05-27	11:00:00	90	Język angielski	mgr A. Gunia-Tracz	108D	Lek2	laboratoria	aktywne
66bf7fda-2de0-4f41-9544-9ed21842ef98	IwIKs4	2026-05-27	12:45:00	90	Język angielski	mgr A. Gunia-Tracz	108D	Lek1	laboratoria	aktywne
694001c2-f877-4b83-b930-9587cdfc4a6b	IwIKs4	2026-05-27	14:30:00	90	Programowanie technik pomiarowych	dr inż. M. Pawlik	A3	W	wykład	aktywne
721e038c-8129-42fa-af1b-89f7b8fa85c2	IwIKs4	2026-05-27	16:15:00	90	Programowanie w języku JAVA	dr inż. S. Bąk	201	Lk2	laboratoria	aktywne
9be1ed94-cc04-473c-929f-ecd898b3231c	IwIKs4	2026-05-27	18:00:00	90	Programowanie w języku JAVA	dr inż. S. Bąk	201	Lk3	laboratoria	aktywne
d168115d-64fe-4019-8de5-bcdd422c0ce5	IwIKs4	2026-05-27	19:45:00	90	Programowanie w języku JAVA	dr inż. S. Bąk	201	Lk4	laboratoria	aktywne
e3e79dce-d0d0-47e8-ab5d-016148830bdf	IwIKs4	2026-05-28	07:30:00	135	Sieci komputerowe	mgr inż. G. Nowakowski	202	L3	laboratoria	aktywne
e3e15c43-3b2b-4272-beda-4b5da98303e3	IwIKs4	2026-05-28	07:30:00	135	Mikroprocesory i mikrokontrolery	dr inż. A. Drwal	06	P1	laboratoria	aktywne
c51e352c-7204-4392-868a-a8bccb0ccfdf	IwIKs4	2026-05-28	10:00:00	135	Sieci komputerowe	mgr inż. G. Nowakowski	202	L2	laboratoria	aktywne
88df39f1-74a1-479e-ae8d-095523fbd021	IwIKs4	2026-05-28	10:00:00	135	Sieci komputerowe	dr inż. P. Król	19	L1	laboratoria	aktywne
023185f2-4b1b-4f3c-b3d5-e5bddc9d9b36	IwIKs4	2026-05-28	12:30:00	135	Sieci komputerowe	mgr inż. G. Nowakowski	202	L4	laboratoria	aktywne
1f5003af-fb3e-4685-9d67-e26c39fd2c90	IwIKs4	2026-05-28	12:30:00	180	Mikroprocesory i mikrokontrolery	dr inż. K. Suchenia	101B	P2	laboratoria	aktywne
73c37d31-d716-4dcb-9b59-b0a2153bd48e	IwIKs4	2026-05-29	07:30:00	135	Podstawy baz danych	dr inż. J. Strug	A2	W	wykład	aktywne
12bc8f9b-cfa0-41eb-85e8-ec010f996dac	IwIKs4	2026-05-29	10:00:00	135	Podstawy baz danych	dr inż. J. Strug	18	P2	laboratoria	aktywne
90100838-ade9-448e-afeb-92a47ca5be54	IwIKs4	2026-05-29	12:30:00	135	Podstawy baz danych	dr inż. J. Strug	18	P4	laboratoria	aktywne
fd57cd4e-49a6-464c-9c1c-37f025b33294	IwIKs4	2026-06-01	11:00:00	135	Sieci komputerowe	mgr inż. K. Kiełkowicz	202	L6	laboratoria	aktywne
95180377-4d15-403f-abe6-6a5407cb47f2	IwIKs4	2026-06-01	11:00:00	135	Mikroprocesory i mikrokontrolery	mgr inż. M. Raźny	208E	P3	laboratoria	aktywne
3666d09a-4c0e-4a99-8a1c-f52f4ccc5052	IwIKs4	2026-06-01	13:30:00	135	Sieci komputerowe	mgr inż. K. Kiełkowicz	202	L5	laboratoria	aktywne
87a15df5-5351-4178-9150-52b63dad3d92	IwIKs4	2026-06-01	14:30:00	90	Mikroprocesory i mikrokontrolery	dr inż. S. Żaba	06	L6	laboratoria	aktywne
9a9e1208-3d55-443b-be3e-eb87c47af2b0	IwIKs4	2026-06-01	16:15:00	90	Mikroprocesory i mikrokontrolery	dr inż. S. Żaba	06	L5	laboratoria	aktywne
2fbe29e0-b264-4b32-8c69-e7ab1b1051f0	IwIKs4	2026-06-01	18:00:00	90	Mikroprocesory i mikrokontrolery	dr inż. S. Żaba	06	P4	laboratoria	aktywne
5ad857e3-4f44-433f-9fe3-1a0aa1cc77ba	IwIKs4	2026-06-02	07:30:00	90	Podstawy baz danych	dr inż. J. Strug	19	Lk1	laboratoria	aktywne
85f9142d-1be7-4ce2-840b-58b070994cf0	IwIKs4	2026-06-02	07:30:00	90	Programowanie technik pomiarowych	dr inż. M. Pawlik	201	Lk2	laboratoria	aktywne
2cde9e2b-563f-4050-8685-97f91abcf593	IwIKs4	2026-06-02	09:15:00	90	Podstawy baz danych	dr inż. J. Strug	19	Lk2	laboratoria	aktywne
1ddb0162-ac50-495d-ab45-65bfea9bf6b1	IwIKs4	2026-06-02	09:15:00	90	Programowanie technik pomiarowych	dr inż. M. Pawlik	201	Lk3	laboratoria	aktywne
4778dd75-fadf-468b-96f4-0576a2dff721	IwIKs4	2026-06-02	11:00:00	90	Podstawy baz danych	dr inż. J. Strug	19	Lk3	laboratoria	aktywne
139c6e9b-42b8-41b3-9720-83ed57f3aaaf	IwIKs4	2026-06-02	11:00:00	90	Programowanie technik pomiarowych	dr inż. M. Pawlik	201	Lk4	laboratoria	aktywne
feb359d6-e186-492f-9789-af9407fc4174	IwIKs4	2026-06-02	12:45:00	90	Podstawy baz danych	dr inż. J. Strug	19	Lk4	laboratoria	aktywne
e6e7d042-bae5-4436-979c-9943b5bb2e51	IwIKs4	2026-06-02	12:45:00	90	Programowanie technik pomiarowych	dr inż. M. Pawlik	201	Lk1	laboratoria	aktywne
78845db9-8989-4b97-a005-f62bbd8bdb0f	IwIKs4	2026-06-02	14:30:00	90	Programowanie w języku JAVA	dr inż. S. Bąk	A3	W	wykład	aktywne
60b54bcf-2cc7-4682-9f45-268c320245e5	IwIKs4	2026-06-02	16:15:00	90	Programowanie w języku JAVA	dr inż. S. Bąk	201	Lk1	laboratoria	aktywne
82144b63-b975-4455-805a-266b72925070	IwIKs4	2026-06-02	18:00:00	90	Programowanie w języku JAVA	dr inż. S. Bąk	201	P4	laboratoria	aktywne
1e0680f1-d4db-48ec-b2ee-e2176001a11e	IwIKs4	2026-06-02	19:45:00	90	Programowanie w języku JAVA	dr inż. S. Bąk	201	P2	laboratoria	aktywne
a9ecec5a-93fa-40ee-ad4e-c2a3c77dc742	IwIKs4	2026-06-03	09:15:00	90	Język angielski	mgr A. Gunia-Tracz	108D	Lek3	laboratoria	aktywne
0e550d42-e921-4a4a-b153-a5ca6e8495f7	IwIKs4	2026-06-03	11:00:00	90	Język angielski	mgr A. Gunia-Tracz	108D	Lek2	laboratoria	aktywne
17ea5ec0-ebfe-4ee2-a5c0-7014fcd07c08	IwIKs4	2026-06-03	12:45:00	90	Język angielski	mgr A. Gunia-Tracz	108D	Lek1	laboratoria	aktywne
772a9d1e-e7f5-4c7a-80e9-3f3f0603a040	IwIKs4	2026-06-03	14:30:00	90	Programowanie technik pomiarowych	dr inż. M. Pawlik	A3	W	wykład	aktywne
9a3bb0c0-d752-4f48-9589-f1a07541bd75	IwIKs4	2026-06-03	16:15:00	90	Programowanie w języku JAVA	dr inż. S. Bąk	201	Lk2	laboratoria	aktywne
218cbac8-3f70-4a22-b86f-56503b3319ae	IwIKs4	2026-06-03	18:00:00	90	Programowanie w języku JAVA	dr inż. S. Bąk	201	Lk3	laboratoria	aktywne
2d8314f7-6d04-4411-b101-8592f7e81c70	IwIKs4	2026-06-03	19:45:00	90	Programowanie w języku JAVA	dr inż. S. Bąk	201	Lk4	laboratoria	aktywne
e206b8f8-89cd-4e61-b07e-0a639b1a63f9	IwIKs4	2026-06-04	07:00:00	900	Boże Ciało	Brak	-	Wszystkie grupy	święto	wolne
8995b098-0d48-4371-94d8-81b2a79aef32	IwIKs4	2026-06-05	07:00:00	900	Boże Ciało	Brak	-	Wszystkie grupy	święto	wolne
cca7fd8c-51e3-42c0-835b-ba7d3117550d	IwIKs4	2026-06-08	11:00:00	135	Sieci komputerowe	mgr inż. K. Kiełkowicz	202	L6	laboratoria	aktywne
46da67fd-b642-448e-b319-5ed1f3063daf	IwIKs4	2026-06-08	11:00:00	135	Mikroprocesory i mikrokontrolery	mgr inż. M. Raźny	208E	P3	laboratoria	aktywne
84d6e9d3-518b-44ea-be96-7bc9ca0bd08f	IwIKs4	2026-06-08	13:30:00	135	Sieci komputerowe	mgr inż. K. Kiełkowicz	202	L5	laboratoria	aktywne
044aa996-3d95-4d39-ab08-174011352508	IwIKs4	2026-06-08	14:30:00	90	Mikroprocesory i mikrokontrolery	dr inż. S. Żaba	06	L6	laboratoria	aktywne
9aad5efb-3b3f-4528-a55a-cd2ec1ceb18c	IwIKs4	2026-06-08	16:15:00	90	Mikroprocesory i mikrokontrolery	dr inż. S. Żaba	06	L5	laboratoria	aktywne
3a1fc3b0-cb50-4399-a662-df3f64dcf9eb	IwIKs4	2026-06-09	07:30:00	90	Podstawy baz danych	dr inż. J. Strug	19	Lk1	laboratoria	aktywne
d568f2e1-fc6a-45c0-9870-dca800baeb2f	IwIKs4	2026-06-09	07:30:00	90	Programowanie technik pomiarowych	dr inż. M. Pawlik	201	Lk2	laboratoria	aktywne
e756dc09-00ef-4a90-8c2d-0fcd397f7bbc	IwIKs4	2026-06-09	09:15:00	90	Podstawy baz danych	dr inż. J. Strug	19	Lk2	laboratoria	aktywne
407dc804-4ea9-408e-a3e5-bbde19bf3edb	IwIKs4	2026-06-09	09:15:00	90	Programowanie technik pomiarowych	dr inż. M. Pawlik	201	Lk3	laboratoria	aktywne
3768633d-5d82-49bc-b0d3-67bd3e6e6edb	IwIKs4	2026-06-09	11:00:00	90	Podstawy baz danych	dr inż. J. Strug	19	Lk3	laboratoria	aktywne
9a179518-2ce0-424a-8cd7-18d803824635	IwIKs4	2026-06-09	11:00:00	90	Programowanie technik pomiarowych	dr inż. M. Pawlik	201	Lk4	laboratoria	aktywne
d4488f2b-d282-4188-b50c-3c12076f9ca0	IwIKs4	2026-06-09	12:45:00	90	Podstawy baz danych	dr inż. J. Strug	19	Lk4	laboratoria	aktywne
e822ff8a-3c74-4d3b-b61a-a98785024bef	IwIKs4	2026-06-09	12:45:00	90	Programowanie technik pomiarowych	dr inż. M. Pawlik	201	Lk1	laboratoria	aktywne
1f9ad4f0-310d-4881-891e-ce4b39f0852a	IwIKs4	2026-06-09	14:30:00	90	Programowanie w języku JAVA	dr inż. S. Bąk	A3	W	wykład	aktywne
4102c3a9-874b-486c-88dc-c3fb7244321f	IwIKs4	2026-06-09	16:15:00	90	Programowanie w języku JAVA	dr inż. S. Bąk	201	Lk1	laboratoria	aktywne
e236000d-5c40-4870-a936-41917fbfce60	IwIKs4	2026-06-09	18:00:00	90	Programowanie w języku JAVA	dr inż. S. Bąk	201	P3	laboratoria	aktywne
1eab7171-b4f9-4f3e-8308-c0748f93b183	IwIKs4	2026-06-09	19:45:00	90	Programowanie w języku JAVA	dr inż. S. Bąk	201	P1	laboratoria	aktywne
c241cb19-eced-4aee-b737-c80414936d75	IwIKs4	2026-06-10	09:15:00	90	Język angielski	mgr A. Gunia-Tracz	108D	Lek3	laboratoria	aktywne
c1b69f8f-c7d0-412b-b4af-0c560431bd29	IwIKs4	2026-06-10	11:00:00	90	Język angielski	mgr A. Gunia-Tracz	108D	Lek2	laboratoria	aktywne
d8b44ad8-e8d6-4d6b-88f6-0a36be6d9ba2	IwIKs4	2026-06-10	12:45:00	90	Język angielski	mgr A. Gunia-Tracz	108D	Lek1	laboratoria	aktywne
7b319fd4-190f-4b99-9c42-bf0b7276a788	IwIKs4	2026-06-10	14:30:00	90	Programowanie technik pomiarowych	dr inż. M. Pawlik	A3	W	wykład	aktywne
0b76ae19-7b10-4f35-b918-4fb7e786d08f	IwIKs4	2026-06-10	16:15:00	90	Programowanie w języku JAVA	dr inż. S. Bąk	201	Lk2	laboratoria	aktywne
59933034-4cd7-4b7b-9fef-cccd60c9fb56	IwIKs4	2026-06-10	18:00:00	90	Programowanie w języku JAVA	dr inż. S. Bąk	201	Lk3	laboratoria	aktywne
54e55730-10a9-4cad-a0d9-b51e4d8bfc4e	IwIKs4	2026-06-10	19:45:00	90	Programowanie w języku JAVA	dr inż. S. Bąk	201	Lk4	laboratoria	aktywne
83fb9e1d-173e-4bd0-9da3-9b67aae727e8	IwIKs4	2026-06-11	07:30:00	135	Sieci komputerowe	mgr inż. G. Nowakowski	202	L3	laboratoria	aktywne
842e8e5d-25d3-4a9a-b6f2-a5e0157e9d22	IwIKs4	2026-06-11	07:30:00	135	Mikroprocesory i mikrokontrolery	dr inż. A. Drwal	06	P1	laboratoria	aktywne
540adb4d-086c-407c-a295-601994cdffcf	IwIKs4	2026-06-11	10:00:00	135	Sieci komputerowe	mgr inż. G. Nowakowski	202	L2	laboratoria	aktywne
d722dba1-b19d-4e09-902a-e468285d1bfa	IwIKs4	2026-06-11	10:00:00	135	Sieci komputerowe	dr inż. P. Król	19	L1	laboratoria	aktywne
b2d4a7eb-86b6-49e1-b4de-f64a61152057	IwIKs4	2026-06-11	12:30:00	135	Sieci komputerowe	mgr inż. G. Nowakowski	202	L4	laboratoria	aktywne
7d852b42-980f-4a1f-91bc-088c81844566	IwIKs4	2026-06-11	12:30:00	180	Mikroprocesory i mikrokontrolery	dr inż. K. Suchenia	101B	P2	laboratoria	aktywne
92f69f55-1cb4-4f42-98e8-b4d720cc4af0	IwIKs4	2026-06-12	07:30:00	135	Podstawy baz danych	dr inż. J. Strug	A2	W	wykład	aktywne
aee0760d-1bec-4f7b-8a91-0518daa9e5be	IwIKs4	2026-06-12	07:30:00	135	Sieci komputerowe	mgr inż. G. Nowakowski	202	L2	laboratoria	aktywne
b8a38259-f6eb-417a-a590-e228a2f4c8f3	IwIKs4	2026-06-12	10:00:00	135	Podstawy baz danych	dr inż. J. Strug	18	P2	laboratoria	aktywne
53b3f993-abf1-4225-a1ac-1d8b0c93dc89	IwIKs4	2026-06-12	10:00:00	135	Sieci komputerowe	mgr inż. G. Nowakowski	202	L4	laboratoria	aktywne
528791fb-8bbc-403b-b0e8-d5fc1db756b4	IwIKs4	2026-06-12	12:30:00	135	Podstawy baz danych	dr inż. J. Strug	18	P4	laboratoria	aktywne
565d7aa3-624b-4dbc-8c79-e8f7da3711a3	IwIKs4	2026-06-12	12:30:00	135	Sieci komputerowe	mgr inż. G. Nowakowski	202	L3	laboratoria	aktywne
1d8b9096-bc40-497a-bd75-0cda07e45c4a	IwIKs4	2026-06-15	11:00:00	135	Sieci komputerowe	mgr inż. K. Kiełkowicz	202	L6	laboratoria	aktywne
9ae4bcf8-e636-4828-a94e-be19b2713b8e	IwIKs4	2026-06-15	11:00:00	135	Mikroprocesory i mikrokontrolery	mgr inż. M. Raźny	208E	P3	laboratoria	aktywne
393f0936-87e2-4ac2-8e95-912fb9d9fda1	IwIKs4	2026-06-15	13:30:00	135	Sieci komputerowe	mgr inż. K. Kiełkowicz	202	L5	laboratoria	aktywne
a0d6719e-4b09-458e-897b-9340c50d512d	IwIKs4	2026-06-15	14:30:00	90	Mikroprocesory i mikrokontrolery	dr inż. S. Żaba	06	L6	laboratoria	aktywne
53a4995d-f1b2-4600-9604-6193db11e1fe	IwIKs4	2026-06-15	16:15:00	90	Mikroprocesory i mikrokontrolery	dr inż. S. Żaba	06	L5	laboratoria	aktywne
174ff986-58d0-4ad0-abc4-d51c4ba4e0dc	IwIKs4	2026-06-15	18:00:00	135	Mikroprocesory i mikrokontrolery	dr inż. S. Żaba	06	P4	laboratoria	aktywne
6a9b99ba-e781-401f-9509-5f6a2d1ef063	IwIKs4	2026-06-16	07:30:00	90	Podstawy baz danych	dr inż. J. Strug	19	Lk1	laboratoria	aktywne
cda48fe0-5a26-44cd-90a9-62b2e06925b2	IwIKs4	2026-06-16	07:30:00	90	Programowanie technik pomiarowych	dr inż. M. Pawlik	201	Lk2	laboratoria	aktywne
c65af48e-5751-4f13-b3a9-a62d46de1526	IwIKs4	2026-06-16	09:15:00	90	Podstawy baz danych	dr inż. J. Strug	19	Lk2	laboratoria	aktywne
3ecda127-d915-41a8-8804-30194d965822	IwIKs4	2026-06-16	09:15:00	90	Programowanie technik pomiarowych	dr inż. M. Pawlik	201	Lk3	laboratoria	aktywne
b8e3a372-1b2b-4699-ae78-82e5b78e45f8	IwIKs4	2026-06-16	11:00:00	90	Podstawy baz danych	dr inż. J. Strug	19	Lk3	laboratoria	aktywne
c5145cc5-151e-4184-ab05-df6b542046bc	IwIKs4	2026-06-16	11:00:00	90	Programowanie technik pomiarowych	dr inż. M. Pawlik	201	Lk4	laboratoria	aktywne
e70850d8-f89c-44aa-b61b-8ad12c9245a6	IwIKs4	2026-06-16	12:45:00	90	Podstawy baz danych	dr inż. J. Strug	19	Lk4	laboratoria	aktywne
30846ef2-251e-41fc-993d-b492a43e77f3	IwIKs4	2026-06-16	12:45:00	90	Programowanie technik pomiarowych	dr inż. M. Pawlik	201	Lk1	laboratoria	aktywne
ceed21a7-713f-47e4-82a0-6653e7aa7aa1	IwIKs4	2026-06-16	14:30:00	90	Programowanie w języku JAVA	dr inż. S. Bąk	A3	W	wykład	aktywne
bce752b9-64e1-471c-801b-19f3c9ee96bf	IwIKs4	2026-06-16	16:15:00	90	Programowanie w języku JAVA	dr inż. S. Bąk	201	Lk1	laboratoria	aktywne
03214ec7-035f-49d7-a778-47eb6bc7940a	IwIKs4	2026-06-16	18:00:00	90	Programowanie w języku JAVA	dr inż. S. Bąk	201	P4	laboratoria	aktywne
80a3488a-35ec-4ae3-b5ce-c4cace70ebab	IwIKs4	2026-06-16	19:45:00	90	Programowanie w języku JAVA	dr inż. S. Bąk	201	P2	laboratoria	aktywne
ce195c14-91b9-4031-ae81-ccc113cba543	IwIKs6	2026-02-23	07:30:00	90	Bezpieczeństwo systemów komputerowych	dr inż. A. Suchenia	A3	W	wykład	aktywne
9c60e7d0-145d-4ea4-8084-9d6a726940c4	IwIKs6	2026-02-23	09:15:00	90	Sztuczna inteligencja	mgr inż. J. Krupiński	18	Lk3	laboratoria	aktywne
3c63c133-f579-4356-9472-6ddd5122295a	IwIKs6	2026-02-23	11:00:00	90	Bezpieczeństwo systemów komputerowych	dr inż. A. Suchenia	101B	P1	laboratoria	aktywne
8b75ba38-4fbc-4035-9769-e9f4bc7192d0	IwIKs6	2026-02-23	11:00:00	90	Sztuczna inteligencja	mgr inż. J. Krupiński	18	Lk2	laboratoria	aktywne
f1ef5977-fcec-4067-8ded-40ad8bef3fd6	IwIKs6	2026-02-23	12:45:00	90	Bezpieczeństwo systemów komputerowych	dr inż. A. Suchenia	101B	P2	laboratoria	aktywne
ab3537fb-3399-42be-960d-6e9f559fb683	IwIKs6	2026-02-23	12:45:00	90	Sztuczna inteligencja	mgr inż. J. Krupiński	18	Lk1	laboratoria	aktywne
048c125b-a423-4538-8dee-3a6934c45dba	IwIKs6	2026-02-23	14:30:00	90	Bezpieczeństwo systemów komputerowych	dr inż. A. Suchenia	101B	Lk2	laboratoria	aktywne
b9ce287e-0b9b-46da-9179-c1ab7869106d	IwIKs6	2026-02-23	14:30:00	90	Sztuczna inteligencja	mgr inż. J. Krupiński	18	Lk4	laboratoria	aktywne
930ea57c-491c-47d4-a276-1abcfc4688fd	IwIKs6	2026-02-23	16:15:00	90	Eksploracja danych	mgr inż. K. Czajkowski	201	Lk1 / P1	laboratoria	aktywne
1cbef535-fbe3-4274-9f8a-f6affffbdb2a	IwIKs6	2026-02-23	18:00:00	90	Eksploracja danych	mgr inż. K. Czajkowski	201	Lk2 / P2	laboratoria	aktywne
9da8e938-54bc-4f51-8dda-16b0b824b0f4	IwIKs6	2026-02-23	19:45:00	90	Eksploracja danych	mgr inż. K. Czajkowski	201	Lk3 / P3	laboratoria	aktywne
0af25000-fab3-4b1a-b9e6-8c2fcfb097e6	IwIKs6	2026-02-24	09:15:00	90	Sztuczna inteligencja	prof. Z. Kokosiński / mgr inż. K. Kiełkowicz	A3	W	wykład	aktywne
03464f27-e544-415d-8fa7-465a75d4de79	IwIKs6	2026-02-24	11:00:00	90	Sztuczna inteligencja	mgr inż. K. Kiełkowicz	18	P3	laboratoria	aktywne
5558a663-fb92-4bf4-8e51-7f0e742746b2	IwIKs6	2026-02-24	12:45:00	90	Sztuczna inteligencja	mgr inż. K. Kiełkowicz	18	P1	laboratoria	aktywne
2b762da6-545c-4784-8ecf-cd421464985a	IwIKs6	2026-02-24	14:30:00	90	Podstawy Internetu Rzeczy	dr inż. P. Król	A1	W	wykład	aktywne
e357b352-2428-4817-b5ef-d45b78a1b2b4	IwIKs6	2026-02-24	16:15:00	90	Eksploracja danych	mgr inż. K. Czajkowski	202	Lk4 / P4	laboratoria	aktywne
a04b9d15-6ad3-40fc-aa06-1db6a1bc325e	IwIKs6	2026-02-24	18:00:00	90	Eksploracja danych	mgr inż. K. Czajkowski	A3	W	wykład	aktywne
00189c30-3bb4-46ef-add9-18368fd6b7ef	IwIKs6	2026-02-25	11:45:00	90	Podstawy Internetu Rzeczy	dr inż. P. Król	18	P3	laboratoria	aktywne
ba0a3b0b-7f4c-4e13-90ef-73d65482a162	IwIKs6	2026-02-25	11:45:00	90	Ekonomiczno-prawne aspekty działalności inżynierskiej	dr M. Mikulec	A2	S1	laboratoria	aktywne
ee39c4a0-8e25-49b3-8f9b-176e0428cb33	IwIKs6	2026-02-25	13:30:00	90	Bezpieczeństwo systemów komputerowych	dr inż. A. Suchenia	101B	Lk1	laboratoria	aktywne
9cc9a137-d999-457d-9e1d-5d3178e0e3a0	IwIKs6	2026-02-25	13:30:00	90	Podstawy Internetu Rzeczy	dr inż. P. Król	18	P2	laboratoria	aktywne
65c039b4-8333-47c1-8ac8-9b2756334269	IwIKs6	2026-02-25	13:30:00	90	Ekonomiczno-prawne aspekty działalności inżynierskiej	dr M. Mikulec	A2	S2	laboratoria	aktywne
ed3d2bcf-fa4a-4f59-9c53-64ca90815e9f	IwIKs6	2026-02-25	15:15:00	90	Bezpieczeństwo systemów komputerowych	dr inż. A. Suchenia	101B	Lk4	laboratoria	aktywne
4cf1f7e2-fdf9-438c-8761-08e9e0d265d1	IwIKs6	2026-02-25	15:15:00	90	Podstawy Internetu Rzeczy	dr inż. P. Król	18	P1	laboratoria	aktywne
07cb357e-186c-4e41-ad53-882f87142519	IwIKs6	2026-02-25	17:00:00	90	Bezpieczeństwo systemów komputerowych	dr inż. A. Suchenia	101B	Lk3	laboratoria	aktywne
0a0f7ebc-5ac1-40ce-b7ab-64f66c4834ae	IwIKs6	2026-02-25	17:00:00	90	Podstawy Internetu Rzeczy	dr inż. P. Król	18	P4	laboratoria	aktywne
656e5cdf-d5bb-4811-89b7-e15c15a47de6	IwIKs6	2026-02-26	09:15:00	90	Komputerowe systemy sterowania	dr inż. G. Pędrak	11	P1	laboratoria	aktywne
c18c97c9-6d69-4c9d-bc8e-eb946eaf930d	IwIKs6	2026-02-26	11:00:00	90	Komputerowe systemy sterowania	dr inż. G. Pędrak	11	P3	laboratoria	aktywne
3c00be96-f4fa-452b-81ab-9af2503c7d0e	IwIKs6	2026-02-26	12:45:00	90	Podstawy Internetu Rzeczy	dr inż. P. Król	18	Lk1	laboratoria	aktywne
f9919857-48fc-4daa-bd04-3a742972af7c	IwIKs6	2026-02-26	12:45:00	90	Komputerowe systemy sterowania	dr inż. G. Pędrak	11	L4	laboratoria	aktywne
efd8fc28-9934-4182-aafc-cb02a0a699b1	IwIKs6	2026-02-26	14:30:00	90	Podstawy Internetu Rzeczy	dr inż. P. Król	18	Lk2	laboratoria	aktywne
e227eee5-4aa0-4882-a8fb-2b768204c9a1	IwIKs6	2026-02-26	14:30:00	90	Komputerowe systemy sterowania	dr inż. G. Pędrak	11	L5	laboratoria	aktywne
65c34c52-67ed-4be8-a64a-69f14fab9c95	IwIKs6	2026-02-26	16:15:00	90	Podstawy Internetu Rzeczy	dr inż. P. Król	18	Lk3	laboratoria	aktywne
abc1a193-b653-46b2-99fe-06ef74b4f707	IwIKs6	2026-02-26	18:00:00	90	Podstawy Internetu Rzeczy	dr inż. P. Król	18	Lk4	laboratoria	aktywne
63cb8af0-f7c6-4fbe-af59-0ce68d70d923	IwIKs6	2026-02-27	09:15:00	90	Komputerowe systemy sterowania	dr inż. K. Schiff	11	L1	laboratoria	aktywne
5914d89d-9a3b-48e4-bf1f-14563c7e0f85	IwIKs6	2026-02-27	11:00:00	90	Komputerowe systemy sterowania	dr inż. K. Schiff	11	L2	laboratoria	aktywne
a673440d-93e2-4202-95c5-57da0a73a8c4	IwIKs6	2026-02-27	12:45:00	90	Komputerowe systemy sterowania	dr inż. K. Schiff	11	L3	laboratoria	aktywne
dbbd3a53-8237-41d9-aac4-d837ccac47c3	IwIKs6	2026-02-27	14:30:00	90	Komputerowe systemy sterowania	dr inż. K. Schiff	A3	W	wykład	aktywne
6c9a20c0-6315-44c5-8cdb-6cbc29f60f0b	IwIKs6	2026-03-02	07:30:00	90	Bezpieczeństwo systemów komputerowych	dr inż. A. Suchenia	A3	W	wykład	aktywne
58504b64-4e31-463d-8695-33e30ce5f538	IwIKs6	2026-03-02	09:15:00	90	Sztuczna inteligencja	mgr inż. J. Krupiński	18	Lk3	laboratoria	aktywne
ac733520-d773-409e-bd43-ca46b467a0d6	IwIKs6	2026-03-02	11:00:00	90	Bezpieczeństwo systemów komputerowych	dr inż. A. Suchenia	101B	P3	laboratoria	aktywne
876e055e-fd28-4ce6-9f3e-003cb68bce6b	IwIKs6	2026-03-02	11:00:00	90	Sztuczna inteligencja	mgr inż. J. Krupiński	18	Lk2	laboratoria	aktywne
fe1c09e9-a471-44a5-ba40-6f495977deb3	IwIKs6	2026-03-02	12:45:00	90	Bezpieczeństwo systemów komputerowych	dr inż. A. Suchenia	101B	P4	laboratoria	aktywne
25ef2df7-c3e5-4c07-bc55-0254a72853ab	IwIKs6	2026-03-02	12:45:00	90	Sztuczna inteligencja	mgr inż. J. Krupiński	18	Lk1	laboratoria	aktywne
ca860f34-c0f8-41ff-8eba-b58db7422ffd	IwIKs6	2026-03-02	14:30:00	90	Bezpieczeństwo systemów komputerowych	dr inż. A. Suchenia	101B	Lk2	laboratoria	aktywne
cd314fc8-49e1-4723-a29e-ca9708d08cff	IwIKs6	2026-03-02	14:30:00	90	Sztuczna inteligencja	mgr inż. J. Krupiński	18	Lk4	laboratoria	aktywne
b3dcbaa9-cab6-4286-8228-0110bdd32aa5	IwIKs6	2026-03-02	16:15:00	90	Eksploracja danych	mgr inż. K. Czajkowski	201	Lk1 / P1	laboratoria	aktywne
6ca3de2a-1aa3-49e0-b877-40c11a3842df	IwIKs6	2026-03-02	18:00:00	90	Eksploracja danych	mgr inż. K. Czajkowski	201	Lk2 / P2	laboratoria	aktywne
c3465bf2-7b90-4420-8f6b-5a93ed718cf9	IwIKs6	2026-03-02	19:45:00	90	Eksploracja danych	mgr inż. K. Czajkowski	201	Lk3 / P3	laboratoria	aktywne
104c6417-4890-4edb-8de4-017f2adef847	IwIKs6	2026-03-03	09:15:00	90	Sztuczna inteligencja	prof. Z. Kokosiński / mgr inż. K. Kiełkowicz	A3	W	wykład	aktywne
b307e821-5ef8-421d-afc6-087c869e114a	IwIKs6	2026-03-03	11:00:00	90	Sztuczna inteligencja	mgr inż. K. Kiełkowicz	18	P4	laboratoria	aktywne
02bc6b53-73fc-4d47-a305-0e154b9e3c73	IwIKs6	2026-03-03	12:45:00	90	Sztuczna inteligencja	mgr inż. K. Kiełkowicz	18	P2	laboratoria	aktywne
dca22bc4-67c4-4b32-9426-f7802e4f35f1	IwIKs6	2026-03-03	16:15:00	90	Eksploracja danych	mgr inż. K. Czajkowski	202	Lk4 / P4	laboratoria	aktywne
012d71b6-b4ae-43a9-97c7-0825e929eb9c	IwIKs6	2026-03-03	18:00:00	90	Eksploracja danych	mgr inż. K. Czajkowski	A3	W	wykład	aktywne
74b1e99c-dafb-460c-a9f2-f1ec0afdc77b	IwIKs6	2026-03-04	11:00:00	135	Ekonomiczno-prawne aspekty działalności inżynierskiej	dr M. Mikulec	A2	W	wykład	aktywne
0f86ce26-d743-406a-b12d-715c66a6a44c	IwIKs6	2026-03-04	13:30:00	90	Bezpieczeństwo systemów komputerowych	dr inż. A. Suchenia	101B	Lk1	laboratoria	aktywne
cec57370-4218-4e4c-8fb0-52423fc87038	IwIKs6	2026-03-04	15:15:00	90	Bezpieczeństwo systemów komputerowych	dr inż. A. Suchenia	101B	Lk4	laboratoria	aktywne
5bab7773-5fb8-439e-8f55-e0d810783bcd	IwIKs6	2026-03-04	17:00:00	90	Bezpieczeństwo systemów komputerowych	dr inż. A. Suchenia	101B	Lk3	laboratoria	aktywne
7b87448b-fe06-49e3-a0cf-83834b822bd5	IwIKs6	2026-03-05	09:15:00	90	Komputerowe systemy sterowania	dr inż. G. Pędrak	11	P2	laboratoria	aktywne
cb363099-1386-4a85-be8d-c815e5b45261	IwIKs6	2026-03-05	11:00:00	90	Komputerowe systemy sterowania	dr inż. G. Pędrak	11	P4	laboratoria	aktywne
704a8746-0c6f-468a-8c89-fd2ec94b010a	IwIKs6	2026-03-05	12:45:00	90	Podstawy Internetu Rzeczy	dr inż. P. Król	18	Lk1	laboratoria	aktywne
ff9f6080-ea86-4b01-b000-13e15ee10418	IwIKs6	2026-03-05	12:45:00	90	Komputerowe systemy sterowania	dr inż. G. Pędrak	11	L4	laboratoria	aktywne
8f64a65b-d435-49d4-bebb-f1c32f5df5f7	IwIKs6	2026-03-05	14:30:00	90	Podstawy Internetu Rzeczy	dr inż. P. Król	18	Lk2	laboratoria	aktywne
7017f199-5d32-4fd8-bc1a-47e3a03ae16c	IwIKs6	2026-03-05	14:30:00	90	Komputerowe systemy sterowania	dr inż. G. Pędrak	11	L5	laboratoria	aktywne
1c430500-f26f-4a4c-ae27-23df3bf2399f	IwIKs6	2026-03-05	16:15:00	90	Podstawy Internetu Rzeczy	dr inż. P. Król	18	Lk3	laboratoria	aktywne
df27b429-5ef8-4558-8ef8-98d8d2391351	IwIKs6	2026-03-05	18:00:00	90	Podstawy Internetu Rzeczy	dr inż. P. Król	18	Lk4	laboratoria	aktywne
26351649-4c1d-4a97-9609-77af1f12c40d	IwIKs6	2026-03-09	07:30:00	90	Bezpieczeństwo systemów komputerowych	dr inż. A. Suchenia	A3	W	wykład	aktywne
c144dbfe-ef44-49a1-b4b2-b1fa3e4f6427	IwIKs6	2026-03-09	09:15:00	90	Sztuczna inteligencja	mgr inż. J. Krupiński	18	Lk3	laboratoria	aktywne
221a90ff-a94c-4818-bfbd-84066853612f	IwIKs6	2026-03-09	11:00:00	90	Bezpieczeństwo systemów komputerowych	dr inż. A. Suchenia	101B	P1	laboratoria	aktywne
bbd11ca9-997d-4c71-b724-5f56247ae994	IwIKs6	2026-03-09	11:00:00	90	Sztuczna inteligencja	mgr inż. J. Krupiński	18	Lk2	laboratoria	aktywne
1de0fbf6-23b4-4f45-96e6-8de75eb5659b	IwIKs6	2026-03-09	12:45:00	90	Bezpieczeństwo systemów komputerowych	dr inż. A. Suchenia	101B	P2	laboratoria	aktywne
f6eb9e62-0c2e-4df6-b9ec-77328294d1e1	IwIKs6	2026-03-09	12:45:00	90	Sztuczna inteligencja	mgr inż. J. Krupiński	18	Lk1	laboratoria	aktywne
00ff8cf7-14ac-4953-b10d-bd5c6341b7a4	IwIKs6	2026-03-09	14:30:00	90	Bezpieczeństwo systemów komputerowych	dr inż. A. Suchenia	101B	Lk2	laboratoria	aktywne
a0262f16-9bb3-48ec-a634-b2f59d1b06d5	IwIKs6	2026-03-09	14:30:00	90	Sztuczna inteligencja	mgr inż. J. Krupiński	18	Lk4	laboratoria	aktywne
23ca9b26-4748-4f6a-bbed-e863c56bf75b	IwIKs6	2026-03-09	16:15:00	90	Eksploracja danych	mgr inż. K. Czajkowski	201	Lk1 / P1	laboratoria	aktywne
893ea723-c64f-41df-8950-754bebc4f6b6	IwIKs6	2026-03-09	18:00:00	90	Eksploracja danych	mgr inż. K. Czajkowski	201	Lk2 / P2	laboratoria	aktywne
b6fbff48-d01e-4228-9f67-cc182b0c9e14	IwIKs6	2026-03-09	19:45:00	90	Eksploracja danych	mgr inż. K. Czajkowski	201	Lk3 / P3	laboratoria	aktywne
8102092f-cc4b-4e92-8763-9c187835378c	IwIKs6	2026-03-10	09:15:00	90	Sztuczna inteligencja	prof. Z. Kokosiński / mgr inż. K. Kiełkowicz	A3	W	wykład	aktywne
0fb01f6e-aa02-4ddf-be44-a143c01a1805	IwIKs6	2026-03-10	11:00:00	90	Sztuczna inteligencja	mgr inż. K. Kiełkowicz	18	P3	laboratoria	aktywne
88f38697-60f3-4be4-9065-3a998bcd2586	IwIKs6	2026-03-10	12:45:00	90	Sztuczna inteligencja	mgr inż. K. Kiełkowicz	18	P1	laboratoria	aktywne
a376581c-1188-42cc-9807-40aa04fda9c5	IwIKs6	2026-03-10	14:30:00	90	Podstawy Internetu Rzeczy	dr inż. P. Król	A1	W	wykład	aktywne
5d2aa6df-976a-4918-8ab3-0638d1716439	IwIKs6	2026-03-10	16:15:00	90	Eksploracja danych	mgr inż. K. Czajkowski	202	Lk4 / P4	laboratoria	aktywne
db72c514-a70a-4b2b-9b3a-9e1ad1dc3bd2	IwIKs6	2026-03-10	18:00:00	90	Eksploracja danych	mgr inż. K. Czajkowski	A3	W	wykład	aktywne
b5ec9050-6143-4d47-9619-3ebaff8027a5	IwIKs6	2026-03-11	11:45:00	90	Podstawy Internetu Rzeczy	dr inż. P. Król	18	P3	laboratoria	aktywne
6fbce0d0-92d1-4dc3-8091-98ce67c7e0f8	IwIKs6	2026-03-11	11:45:00	90	Ekonomiczno-prawne aspekty działalności inżynierskiej	dr M. Mikulec	A2	S1	laboratoria	aktywne
4974cee0-7c38-4248-bc54-9e08d58ef69b	IwIKs6	2026-03-11	13:30:00	90	Bezpieczeństwo systemów komputerowych	dr inż. A. Suchenia	101B	Lk1	laboratoria	aktywne
31e55231-ab8b-464c-8f8d-3b5d4c7f15b1	IwIKs6	2026-03-11	13:30:00	90	Podstawy Internetu Rzeczy	dr inż. P. Król	18	P2	laboratoria	aktywne
e842a4c7-ebf1-4545-84f3-1a77db8d1ed2	IwIKs6	2026-03-11	13:30:00	90	Ekonomiczno-prawne aspekty działalności inżynierskiej	dr M. Mikulec	A2	S2	laboratoria	aktywne
4e74aeb0-ad6e-4ee0-9bf4-c82d1de52253	IwIKs6	2026-03-11	15:15:00	90	Bezpieczeństwo systemów komputerowych	dr inż. A. Suchenia	101B	Lk4	laboratoria	aktywne
b3da65e2-7aa1-4336-b77c-9c16ccdb262c	IwIKs6	2026-03-11	15:15:00	90	Podstawy Internetu Rzeczy	dr inż. P. Król	18	P1	laboratoria	aktywne
9bc7a918-ac3a-45ff-923b-c3941f84909b	IwIKs6	2026-03-11	17:00:00	90	Bezpieczeństwo systemów komputerowych	dr inż. A. Suchenia	101B	Lk3	laboratoria	aktywne
5806d6a2-6b39-4ba1-992e-77cffe70d4cd	IwIKs6	2026-03-11	17:00:00	90	Podstawy Internetu Rzeczy	dr inż. P. Król	18	P4	laboratoria	aktywne
bb922683-0e6a-45d8-a04b-191bbc1a0af4	IwIKs6	2026-03-12	09:15:00	90	Komputerowe systemy sterowania	dr inż. G. Pędrak	11	P1	laboratoria	aktywne
e94ba7e9-5da4-4645-a577-e17192f54b8f	IwIKs6	2026-03-12	11:00:00	90	Komputerowe systemy sterowania	dr inż. G. Pędrak	11	P3	laboratoria	aktywne
2fb3d254-0d4c-493f-afeb-2e372c95df12	IwIKs6	2026-03-12	12:45:00	90	Podstawy Internetu Rzeczy	dr inż. P. Król	18	Lk1	laboratoria	aktywne
e04a5226-fbb3-4f60-98a3-f7496d67f95c	IwIKs6	2026-03-12	12:45:00	90	Komputerowe systemy sterowania	dr inż. G. Pędrak	11	L4	laboratoria	aktywne
ffd15490-0a8f-411f-a9df-79e698ab2a92	IwIKs6	2026-03-12	14:30:00	90	Podstawy Internetu Rzeczy	dr inż. P. Król	18	Lk2	laboratoria	aktywne
64631e40-16b8-4256-8c54-66eeb4569b08	IwIKs6	2026-03-12	14:30:00	90	Komputerowe systemy sterowania	dr inż. G. Pędrak	11	L5	laboratoria	aktywne
d32dc536-5ed1-444d-8830-df51d94c9307	IwIKs6	2026-03-12	16:15:00	90	Podstawy Internetu Rzeczy	dr inż. P. Król	18	Lk3	laboratoria	aktywne
6ba8dedd-2ed3-4561-8cc6-4d44f2cc80dc	IwIKs6	2026-03-12	18:00:00	90	Podstawy Internetu Rzeczy	dr inż. P. Król	18	Lk4	laboratoria	aktywne
7ee268b6-807b-4108-959c-60bff6362b65	IwIKs6	2026-03-13	09:15:00	90	Komputerowe systemy sterowania	dr inż. K. Schiff	11	L1	laboratoria	aktywne
8dc39005-e06b-47bc-bb50-3ebd4efdc39d	IwIKs6	2026-03-13	11:00:00	90	Komputerowe systemy sterowania	dr inż. K. Schiff	11	L2	laboratoria	aktywne
e22a6f38-d407-4503-88fc-f6484c7c9ea7	IwIKs6	2026-03-13	12:45:00	90	Komputerowe systemy sterowania	dr inż. K. Schiff	11	L3	laboratoria	aktywne
97efbf4b-961f-4718-a524-96fbbbb71cec	IwIKs6	2026-03-13	14:30:00	135	Komputerowe systemy sterowania	dr inż. K. Schiff	A3	W	wykład	aktywne
7e824360-c316-45fe-b1b7-c8c0e7140f4e	IwIKs6	2026-03-16	07:30:00	90	Bezpieczeństwo systemów komputerowych	dr inż. A. Suchenia	A3	W	wykład	aktywne
11356b9e-0f8e-4ed3-a8b1-21a6547062f0	IwIKs6	2026-03-16	09:15:00	90	Sztuczna inteligencja	mgr inż. J. Krupiński	18	Lk3	laboratoria	aktywne
a359c3af-c4ef-4080-ba5f-783ab692fa70	IwIKs6	2026-03-16	11:00:00	90	Bezpieczeństwo systemów komputerowych	dr inż. A. Suchenia	101B	P3	laboratoria	aktywne
9e42b1a9-3a39-4b05-87e6-c62380f4fff6	IwIKs6	2026-03-16	11:00:00	90	Sztuczna inteligencja	mgr inż. J. Krupiński	18	Lk2	laboratoria	aktywne
8a2bb6e4-011d-4a9f-99a2-7c4121a85987	IwIKs6	2026-03-16	12:45:00	90	Bezpieczeństwo systemów komputerowych	dr inż. A. Suchenia	101B	P4	laboratoria	aktywne
b442e3ff-aba3-4896-be8e-110e3dd82100	IwIKs6	2026-03-16	12:45:00	90	Sztuczna inteligencja	mgr inż. J. Krupiński	18	Lk1	laboratoria	aktywne
1c69a481-d4a8-49df-81b3-3db745c8c8ad	IwIKs6	2026-03-16	14:30:00	90	Bezpieczeństwo systemów komputerowych	dr inż. A. Suchenia	101B	Lk2	laboratoria	aktywne
87484e61-3042-41ef-a1fe-11b751f12105	IwIKs6	2026-03-16	14:30:00	90	Sztuczna inteligencja	mgr inż. J. Krupiński	18	Lk4	laboratoria	aktywne
1adb800b-4b84-4336-961d-37317b69c2e8	IwIKs6	2026-03-16	16:15:00	90	Eksploracja danych	mgr inż. K. Czajkowski	201	Lk1 / P1	laboratoria	aktywne
1fcc351a-58e2-43be-932f-d34bb2abfc66	IwIKs6	2026-03-16	18:00:00	90	Eksploracja danych	mgr inż. K. Czajkowski	201	Lk2 / P2	laboratoria	aktywne
fcbfba09-0df1-486f-84c1-fc8dfa19e6f9	IwIKs6	2026-03-16	19:45:00	90	Eksploracja danych	mgr inż. K. Czajkowski	201	Lk3 / P3	laboratoria	aktywne
189ebe00-1171-4dff-af74-777e7ca5ef9d	IwIKs6	2026-03-17	09:15:00	90	Sztuczna inteligencja	prof. Z. Kokosiński / mgr inż. K. Kiełkowicz	A3	W	wykład	aktywne
1043ad57-90b4-4aa9-b227-6b7ba1f13ad3	IwIKs6	2026-03-17	11:00:00	90	Sztuczna inteligencja	mgr inż. K. Kiełkowicz	18	P4	laboratoria	aktywne
564fe392-336c-42ec-8660-c80ea27097c5	IwIKs6	2026-03-17	12:45:00	90	Sztuczna inteligencja	mgr inż. K. Kiełkowicz	18	P2	laboratoria	aktywne
8cb7fb0d-748e-4e78-8532-27a85ec25a16	IwIKs6	2026-03-17	16:15:00	90	Eksploracja danych	mgr inż. K. Czajkowski	202	Lk4 / P4	laboratoria	aktywne
45bce27c-275a-47bd-942f-ad406b43ea9f	IwIKs6	2026-03-17	18:00:00	90	Eksploracja danych	mgr inż. K. Czajkowski	A3	W	wykład	aktywne
9a10d689-8239-4bfe-b995-c5f3bb487d27	IwIKs6	2026-03-18	11:00:00	135	Ekonomiczno-prawne aspekty działalności inżynierskiej	dr M. Mikulec	A2	W	wykład	aktywne
bda8b158-fe9b-41be-8925-2bede9ef2d7b	IwIKs6	2026-03-18	13:30:00	90	Bezpieczeństwo systemów komputerowych	dr inż. A. Suchenia	101B	Lk1	laboratoria	aktywne
b1a98bc8-460e-4057-8d92-093c8f491fab	IwIKs6	2026-03-18	15:15:00	90	Bezpieczeństwo systemów komputerowych	dr inż. A. Suchenia	101B	Lk4	laboratoria	aktywne
2154c67c-819e-45af-bf26-5402a02e8713	IwIKs6	2026-03-18	17:00:00	90	Bezpieczeństwo systemów komputerowych	dr inż. A. Suchenia	101B	Lk3	laboratoria	aktywne
375eb8bc-2ac1-4e4b-bacc-8e33d18faec7	IwIKs6	2026-03-19	09:15:00	90	Komputerowe systemy sterowania	dr inż. G. Pędrak	11	P2	laboratoria	aktywne
16f8683c-7bac-4d06-9a6e-3fd84dcb7bea	IwIKs6	2026-03-19	11:00:00	90	Komputerowe systemy sterowania	dr inż. G. Pędrak	11	P4	laboratoria	aktywne
5374dfa8-2f29-4fba-8c81-4bbea39738b6	IwIKs6	2026-03-19	12:45:00	90	Podstawy Internetu Rzeczy	dr inż. P. Król	18	Lk1	laboratoria	aktywne
f9eccc2e-6f26-409a-8afe-d684001f254c	IwIKs6	2026-03-19	12:45:00	90	Komputerowe systemy sterowania	dr inż. G. Pędrak	11	L4	laboratoria	aktywne
d6422275-4474-4ae0-937e-100b39495794	IwIKs6	2026-03-19	14:30:00	90	Podstawy Internetu Rzeczy	dr inż. P. Król	18	Lk2	laboratoria	aktywne
e2e6339f-9a40-4712-8d8f-8991f37e8dcb	IwIKs6	2026-03-19	14:30:00	90	Komputerowe systemy sterowania	dr inż. G. Pędrak	11	L5	laboratoria	aktywne
4516e604-52a7-46f7-ba1c-e9900ee3cafb	IwIKs6	2026-03-19	16:15:00	90	Podstawy Internetu Rzeczy	dr inż. P. Król	18	Lk3	laboratoria	aktywne
6b53eadd-3ee0-40b4-9f93-fe7014230e1b	IwIKs6	2026-03-19	18:00:00	90	Podstawy Internetu Rzeczy	dr inż. P. Król	18	Lk4	laboratoria	aktywne
9636c7be-5fa2-487e-b7dc-c382693e77f3	IwIKs6	2026-03-20	09:15:00	90	Komputerowe systemy sterowania	dr inż. K. Schiff	11	L1	laboratoria	aktywne
87df3a00-2447-4ca5-be5e-388049379073	IwIKs6	2026-03-20	11:00:00	90	Komputerowe systemy sterowania	dr inż. K. Schiff	11	L2	laboratoria	aktywne
fd4c3ff2-d95d-4ccf-808e-5663bf59ba76	IwIKs6	2026-03-20	12:45:00	90	Komputerowe systemy sterowania	dr inż. K. Schiff	11	L3	laboratoria	aktywne
0f81d46e-fe0f-4026-8880-1ee449bc861b	IwIKs6	2026-03-20	14:30:00	135	Komputerowe systemy sterowania	dr inż. K. Schiff	A3	W	wykład	aktywne
96a3bb03-2209-4956-bc2b-3b2b7c28c6d8	IwIKs6	2026-03-23	07:30:00	90	Bezpieczeństwo systemów komputerowych	dr inż. A. Suchenia	A3	W	wykład	aktywne
8c7ba0b6-e339-4d5c-abde-b125aaa2a9f5	IwIKs6	2026-03-23	09:15:00	90	Sztuczna inteligencja	mgr inż. J. Krupiński	18	Lk3	laboratoria	aktywne
14dfbb5b-4088-4163-9625-e61af063903b	IwIKs6	2026-03-23	11:00:00	90	Bezpieczeństwo systemów komputerowych	dr inż. A. Suchenia	101B	P1	laboratoria	aktywne
c577fbd0-f6de-4f86-8248-216b0da1d503	IwIKs6	2026-03-23	11:00:00	90	Sztuczna inteligencja	mgr inż. J. Krupiński	18	Lk2	laboratoria	aktywne
f08e59bf-8e85-4505-adcb-269c89138c58	IwIKs6	2026-03-23	12:45:00	90	Bezpieczeństwo systemów komputerowych	dr inż. A. Suchenia	101B	P2	laboratoria	aktywne
5703bbe9-2d49-4848-b9bf-1ee4583d2753	IwIKs6	2026-03-23	12:45:00	90	Sztuczna inteligencja	mgr inż. J. Krupiński	18	Lk1	laboratoria	aktywne
889f46da-2432-43fe-96b5-c6868bedc486	IwIKs6	2026-03-23	14:30:00	90	Bezpieczeństwo systemów komputerowych	dr inż. A. Suchenia	101B	Lk2	laboratoria	aktywne
96abde2b-c118-4654-97cd-93e38bb79583	IwIKs6	2026-03-23	14:30:00	90	Sztuczna inteligencja	mgr inż. J. Krupiński	18	Lk4	laboratoria	aktywne
d367d715-5e0a-41cd-8fec-266c642f381a	IwIKs6	2026-03-23	16:15:00	90	Eksploracja danych	mgr inż. K. Czajkowski	201	Lk1 / P1	laboratoria	aktywne
aa097961-8679-4678-8681-b64c4c003b3c	IwIKs6	2026-03-23	18:00:00	90	Eksploracja danych	mgr inż. K. Czajkowski	201	Lk2 / P2	laboratoria	aktywne
c130a497-3caa-437f-bd85-e7e835fc1f43	IwIKs6	2026-03-23	19:45:00	90	Eksploracja danych	mgr inż. K. Czajkowski	201	Lk3 / P3	laboratoria	aktywne
e8c8375d-a399-4031-862d-84274eaac7c5	IwIKs6	2026-03-24	09:15:00	90	Sztuczna inteligencja	prof. Z. Kokosiński / mgr inż. K. Kiełkowicz	A3	W	wykład	aktywne
4f5c639a-6971-4e5c-b88d-69731cafb2b4	IwIKs6	2026-03-24	11:00:00	90	Sztuczna inteligencja	mgr inż. K. Kiełkowicz	18	P3	laboratoria	aktywne
1f604548-a4c4-48d5-840c-2f59172559c0	IwIKs6	2026-03-24	12:45:00	90	Sztuczna inteligencja	mgr inż. K. Kiełkowicz	18	P1	laboratoria	aktywne
3cc7c0e6-d008-44ed-bfe1-fb95da5b6751	IwIKs6	2026-03-24	14:30:00	90	Podstawy Internetu Rzeczy	dr inż. P. Król	A1	W	wykład	aktywne
9188b1bf-baf0-4b41-a6b2-8857c0d0f282	IwIKs6	2026-03-24	16:15:00	90	Eksploracja danych	mgr inż. K. Czajkowski	202	Lk4 / P4	laboratoria	aktywne
146869dd-1a56-4af4-865f-e73a9fbcf42d	IwIKs6	2026-03-24	18:00:00	90	Eksploracja danych	mgr inż. K. Czajkowski	A3	W	wykład	aktywne
72042fab-8321-4925-b8e6-a44fb5ac6974	IwIKs6	2026-03-25	11:45:00	90	Podstawy Internetu Rzeczy	dr inż. P. Król	18	P3	laboratoria	aktywne
670e016d-f9b7-4ada-9691-ef5d986d666e	IwIKs6	2026-03-25	12:30:00	45	Ekonomiczno-prawne aspekty działalności inżynierskiej	dr M. Mikulec	A2	S1	laboratoria	aktywne
9c1eef78-7f20-4514-81fe-abacdaa19e36	IwIKs6	2026-03-25	13:30:00	90	Bezpieczeństwo systemów komputerowych	dr inż. A. Suchenia	101B	Lk1	laboratoria	aktywne
6b75f6f4-d163-41c3-b390-753308844a7a	IwIKs6	2026-03-25	13:30:00	90	Podstawy Internetu Rzeczy	dr inż. P. Król	18	P2	laboratoria	aktywne
498ef30a-3c6c-40b8-a83d-cf2250406ca8	IwIKs6	2026-03-25	13:30:00	45	Ekonomiczno-prawne aspekty działalności inżynierskiej	dr M. Mikulec	A2	S2	laboratoria	aktywne
76c0c6d7-f586-4101-85f1-d30a5b4fc5be	IwIKs6	2026-03-25	15:15:00	90	Bezpieczeństwo systemów komputerowych	dr inż. A. Suchenia	101B	Lk4	laboratoria	aktywne
4f3db649-ae8f-455c-bb7e-0b0000c57510	IwIKs6	2026-03-25	15:15:00	90	Podstawy Internetu Rzeczy	dr inż. P. Król	18	P1	laboratoria	aktywne
13f747b4-fcda-4c39-9925-4fc769711a9e	IwIKs6	2026-03-25	17:00:00	90	Bezpieczeństwo systemów komputerowych	dr inż. A. Suchenia	101B	Lk3	laboratoria	aktywne
4da6ab51-b566-4738-9f0f-04b68ebb1033	IwIKs6	2026-03-25	17:00:00	90	Podstawy Internetu Rzeczy	dr inż. P. Król	18	P4	laboratoria	aktywne
dc2fd453-f6a6-4d53-a9ce-eb60a21de0e3	IwIKs6	2026-03-26	09:15:00	90	Komputerowe systemy sterowania	dr inż. G. Pędrak	11	P1	laboratoria	aktywne
2e1988c8-2bf8-4cbf-96a9-7ffe550e7bc3	IwIKs6	2026-03-26	11:00:00	90	Komputerowe systemy sterowania	dr inż. G. Pędrak	11	P3	laboratoria	aktywne
27db460d-8874-40af-803c-90c2abbe5e5c	IwIKs6	2026-03-26	12:45:00	90	Podstawy Internetu Rzeczy	dr inż. P. Król	18	Lk1	laboratoria	aktywne
8c106728-28b7-4b8a-913d-045939ca2a5d	IwIKs6	2026-03-26	12:45:00	90	Komputerowe systemy sterowania	dr inż. G. Pędrak	11	L4	laboratoria	aktywne
31abf4e9-3239-45de-a7dd-000019b76a55	IwIKs6	2026-03-26	14:30:00	90	Podstawy Internetu Rzeczy	dr inż. P. Król	18	Lk2	laboratoria	aktywne
912c2ec8-d46e-41a8-b7a3-a111878a0895	IwIKs6	2026-03-26	14:30:00	90	Komputerowe systemy sterowania	dr inż. G. Pędrak	11	L5	laboratoria	aktywne
777cb4ce-38ad-42af-9627-6526cb965943	IwIKs6	2026-03-26	16:15:00	90	Podstawy Internetu Rzeczy	dr inż. P. Król	18	Lk3	laboratoria	aktywne
210e3b4d-9057-41fd-99f8-086b622690c7	IwIKs6	2026-03-26	18:00:00	90	Podstawy Internetu Rzeczy	dr inż. P. Król	18	Lk4	laboratoria	aktywne
cf950fc2-0a3b-420b-aec5-f1898a8d6aa4	IwIKs6	2026-03-27	09:15:00	90	Komputerowe systemy sterowania	dr inż. K. Schiff	11	L1	laboratoria	aktywne
1f16ddbf-2a45-42ec-ad34-71de684546ec	IwIKs6	2026-03-27	11:00:00	90	Komputerowe systemy sterowania	dr inż. K. Schiff	11	L2	laboratoria	aktywne
dc34c471-0ad7-4fcb-9161-c5c83ed82126	IwIKs6	2026-03-27	12:45:00	90	Komputerowe systemy sterowania	dr inż. K. Schiff	11	L3	laboratoria	aktywne
5bb0d45a-5ccb-40aa-a163-7d91853082f4	IwIKs6	2026-03-27	14:30:00	135	Komputerowe systemy sterowania	dr inż. K. Schiff	A3	W	wykład	aktywne
e78051bb-1777-47a9-9998-e2e7f80abb5e	IwIKs6	2026-03-30	07:30:00	90	Bezpieczeństwo systemów komputerowych	dr inż. A. Suchenia	A3	W	wykład	aktywne
df8ae524-c858-4c2d-8d4e-70085e82f670	IwIKs6	2026-03-30	09:15:00	90	Sztuczna inteligencja	mgr inż. J. Krupiński	18	Lk3	laboratoria	aktywne
6e89e0c1-577e-4b30-9eb4-be9b30c6630a	IwIKs6	2026-03-30	11:00:00	90	Bezpieczeństwo systemów komputerowych	dr inż. A. Suchenia	101B	P3	laboratoria	aktywne
8006592a-16b4-4bd0-9241-a06110bc1329	IwIKs6	2026-03-30	11:00:00	90	Sztuczna inteligencja	mgr inż. J. Krupiński	18	Lk2	laboratoria	aktywne
22d2af15-1032-47fe-ae98-a5542ddee663	IwIKs6	2026-03-30	12:45:00	90	Bezpieczeństwo systemów komputerowych	dr inż. A. Suchenia	101B	P4	laboratoria	aktywne
d09f1a99-1301-472e-85ea-d78598d12c46	IwIKs6	2026-03-30	12:45:00	90	Sztuczna inteligencja	mgr inż. J. Krupiński	18	Lk1	laboratoria	aktywne
32ce2879-4904-4904-bf7f-f5527e3208aa	IwIKs6	2026-03-30	14:30:00	90	Sztuczna inteligencja	mgr inż. J. Krupiński	18	Lk4	laboratoria	aktywne
68f9477a-925a-4ddf-8119-bf3646ef6919	IwIKs6	2026-03-30	16:15:00	90	Eksploracja danych	mgr inż. K. Czajkowski	201	Lk1 / P1	laboratoria	aktywne
b3063b37-af28-4cda-8e7f-3992425e7082	IwIKs6	2026-03-30	18:00:00	90	Eksploracja danych	mgr inż. K. Czajkowski	201	Lk2 / P2	laboratoria	aktywne
274e9250-819a-4f81-9105-b5093fc3a697	IwIKs6	2026-03-30	18:00:00	90	Bezpieczeństwo systemów komputerowych	mgr inż. K. Kopera	101B	Lk3	laboratoria	aktywne
976e9af2-cb5a-4b1b-a409-98992403e381	IwIKs6	2026-03-30	19:45:00	90	Eksploracja danych	mgr inż. K. Czajkowski	201	Lk3 / P3	laboratoria	aktywne
79e78502-eab4-4bbc-b74f-742ac1f37881	IwIKs6	2026-03-30	19:45:00	90	Bezpieczeństwo systemów komputerowych	mgr inż. K. Kopera	101B	Lk2	laboratoria	aktywne
565bca70-0416-470e-ab32-fbb2d374602b	IwIKs6	2026-03-31	09:15:00	90	Sztuczna inteligencja	prof. Z. Kokosiński / mgr inż. K. Kiełkowicz	A3	W	wykład	aktywne
6e3df7ba-86aa-40ea-aa1f-33aa50a48f7a	IwIKs6	2026-03-31	11:00:00	90	Sztuczna inteligencja	mgr inż. K. Kiełkowicz	18	P4	laboratoria	aktywne
ed4bd8ee-c3a0-41c5-a734-a089f428bca3	IwIKs6	2026-03-31	12:45:00	90	Sztuczna inteligencja	mgr inż. K. Kiełkowicz	18	P2	laboratoria	aktywne
5a3229b9-4fe1-4642-8207-e1be7a61f697	IwIKs6	2026-03-31	16:15:00	90	Eksploracja danych	mgr inż. K. Czajkowski	202	Lk4 / P4	laboratoria	aktywne
66a14787-1d38-4e6d-b0eb-38f5c8c27060	IwIKs6	2026-03-31	18:00:00	90	Eksploracja danych	mgr inż. K. Czajkowski	A3	W	wykład	aktywne
8a909bc6-498f-4f6d-8289-0372b2d9b89d	IwIKs6	2026-04-01	07:00:00	900	Przerwa świąteczna	Brak	-	Wszystkie grupy	święto	wolne
7dd07ebb-742d-4828-bb1a-f5c70e9cf65d	IwIKs6	2026-04-02	07:00:00	900	Przerwa świąteczna	Brak	-	Wszystkie grupy	święto	wolne
66d50f2b-c8ef-4d81-87c0-776f394037ee	IwIKs6	2026-04-03	07:00:00	900	Przerwa świąteczna	Brak	-	Wszystkie grupy	święto	wolne
ca1093c6-ef6b-4794-b3b5-0688fdbccbe7	IwIKs6	2026-04-04	07:00:00	900	Przerwa świąteczna	Brak	-	Wszystkie grupy	święto	wolne
3024e72b-cfc9-41e4-8962-cc8e5cd97a01	IwIKs6	2026-04-05	07:00:00	900	Przerwa świąteczna	Brak	-	Wszystkie grupy	święto	wolne
66a11e2e-04ab-4c93-a927-aa618cf7c755	IwIKs6	2026-04-06	07:00:00	900	Przerwa świąteczna	Brak	-	Wszystkie grupy	święto	wolne
e7a5eca3-d832-4196-b194-c00da0bdfc12	IwIKs6	2026-04-07	07:00:00	900	Przerwa świąteczna	Brak	-	Wszystkie grupy	święto	wolne
5012cf50-c81e-4e4e-8c5e-d8d6fdc8c7c6	IwIKs6	2026-04-08	11:45:00	90	Podstawy Internetu Rzeczy	dr inż. P. Król	18	P3	laboratoria	aktywne
6c74ea52-6bc2-4598-be4f-39d7b9d03904	IwIKs6	2026-04-08	13:30:00	90	Podstawy Internetu Rzeczy	dr inż. P. Król	18	P2	laboratoria	aktywne
b16ec964-0e17-46dc-9d06-982f0ecb30ad	IwIKs6	2026-04-08	15:15:00	90	Podstawy Internetu Rzeczy	dr inż. P. Król	18	P1	laboratoria	aktywne
f9f7851f-c2e7-4141-8a4d-8562bfb47feb	IwIKs6	2026-04-08	17:00:00	90	Podstawy Internetu Rzeczy	dr inż. P. Król	18	P4	laboratoria	aktywne
21689bd4-b4cf-45e8-90b7-04445272cd68	IwIKs6	2026-04-08	17:00:00	90	Bezpieczeństwo systemów komputerowych	mgr inż. K. Kopera	101B	Lk1	laboratoria	aktywne
0764fe91-173a-47f1-8447-555de5e2961c	IwIKs6	2026-04-08	18:45:00	90	Bezpieczeństwo systemów komputerowych	mgr inż. K. Kopera	101B	Lk4	laboratoria	aktywne
2ce7952a-183f-4e51-9b11-ccfa7fb0ddd3	IwIKs6	2026-04-09	09:15:00	90	Komputerowe systemy sterowania	dr inż. G. Pędrak	11	P1	laboratoria	aktywne
d34c7b05-f446-41fd-88b1-c1cbfd6e6d30	IwIKs6	2026-04-09	11:00:00	90	Komputerowe systemy sterowania	dr inż. G. Pędrak	11	P3	laboratoria	aktywne
55f4ecef-b8e3-4813-8c60-42329b9b1984	IwIKs6	2026-04-09	12:45:00	90	Podstawy Internetu Rzeczy	dr inż. P. Król	18	Lk1	laboratoria	aktywne
2b709392-e790-4abb-ac18-fc0c956556ee	IwIKs6	2026-04-09	12:45:00	90	Komputerowe systemy sterowania	dr inż. G. Pędrak	11	L4	laboratoria	aktywne
f225bc0b-2cee-461f-b5ad-54d9c2eeed83	IwIKs6	2026-04-09	14:30:00	90	Podstawy Internetu Rzeczy	dr inż. P. Król	18	Lk2	laboratoria	aktywne
e74c723b-95d5-44e1-8ea0-99f1b90340d7	IwIKs6	2026-04-09	14:30:00	90	Komputerowe systemy sterowania	dr inż. G. Pędrak	11	L5	laboratoria	aktywne
51f25ee1-0f59-4458-a937-dd957b487f83	IwIKs6	2026-04-09	16:15:00	90	Podstawy Internetu Rzeczy	dr inż. P. Król	18	Lk3	laboratoria	aktywne
6078347b-068a-4d0c-9f68-e6a2b729716b	IwIKs6	2026-04-09	18:00:00	90	Podstawy Internetu Rzeczy	dr inż. P. Król	18	Lk4	laboratoria	aktywne
e925130f-77bf-4dfd-8920-a20c0dbecd71	IwIKs6	2026-04-10	09:15:00	90	Komputerowe systemy sterowania	dr inż. K. Schiff	11	L1	laboratoria	aktywne
ccb87bb1-0e2c-46e4-be12-fb52c52f5a17	IwIKs6	2026-04-10	11:00:00	90	Komputerowe systemy sterowania	dr inż. K. Schiff	11	L2	laboratoria	aktywne
fa982f76-776b-45eb-8883-cb0efaf1750a	IwIKs6	2026-04-10	12:45:00	90	Komputerowe systemy sterowania	dr inż. K. Schiff	11	L3	laboratoria	aktywne
32f1e0b6-7ffc-4635-a239-ef74244ad794	IwIKs6	2026-04-10	14:30:00	135	Komputerowe systemy sterowania	dr inż. K. Schiff	A3	W	wykład	aktywne
936342af-2578-42bc-adda-d7924dba4e32	IwIKs6	2026-04-13	07:30:00	90	Bezpieczeństwo systemów komputerowych	dr inż. A. Suchenia	A3	W	wykład	aktywne
505f1e1a-9480-403b-99eb-4a52009249b1	IwIKs6	2026-04-13	09:15:00	90	Sztuczna inteligencja	mgr inż. J. Krupiński	18	Lk3	laboratoria	aktywne
6db0ea23-571c-480d-abbc-9e618d4b66ee	IwIKs6	2026-04-13	11:00:00	90	Bezpieczeństwo systemów komputerowych	dr inż. A. Suchenia	101B	P3	laboratoria	aktywne
e3334448-6fef-46c8-8c78-5b8487421edb	IwIKs6	2026-04-13	11:00:00	90	Sztuczna inteligencja	mgr inż. J. Krupiński	18	Lk2	laboratoria	aktywne
9e954a23-268c-49db-829a-30e486e14514	IwIKs6	2026-04-13	12:45:00	90	Bezpieczeństwo systemów komputerowych	dr inż. A. Suchenia	101B	P4	laboratoria	aktywne
b4dcd301-f374-4f66-b619-1f3d440c73ba	IwIKs6	2026-04-13	12:45:00	90	Sztuczna inteligencja	mgr inż. J. Krupiński	18	Lk1	laboratoria	aktywne
b1829d51-018d-46f4-8cb8-5742e4bf8e34	IwIKs6	2026-04-13	14:30:00	90	Sztuczna inteligencja	mgr inż. J. Krupiński	18	Lk4	laboratoria	aktywne
6f6af829-0b97-4a8b-ae06-2dcbceb34f69	IwIKs6	2026-04-13	16:15:00	90	Eksploracja danych	mgr inż. K. Czajkowski	201	Lk1 / P1	laboratoria	aktywne
2eb8ab97-ea60-4bee-8115-efbadc9eaa92	IwIKs6	2026-04-13	18:00:00	90	Eksploracja danych	mgr inż. K. Czajkowski	201	Lk2 / P2	laboratoria	aktywne
ca2e9fb8-a2f2-41df-a958-5690c580c853	IwIKs6	2026-04-13	18:00:00	90	Bezpieczeństwo systemów komputerowych	mgr inż. K. Kopera	101B	Lk3	laboratoria	aktywne
39a30d53-1654-44b0-929e-44151aa5ec9b	IwIKs6	2026-04-13	19:45:00	90	Eksploracja danych	mgr inż. K. Czajkowski	201	Lk3 / P3	laboratoria	aktywne
21bad7aa-7d62-4aa3-96b1-078273719f4c	IwIKs6	2026-04-13	19:45:00	90	Bezpieczeństwo systemów komputerowych	mgr inż. K. Kopera	101B	Lk2	laboratoria	aktywne
dfc56ad6-f1cb-4103-af3c-ccc043cfcc5b	IwIKs6	2026-04-14	09:15:00	90	Sztuczna inteligencja	prof. Z. Kokosiński / mgr inż. K. Kiełkowicz	A3	W	wykład	aktywne
bd21d31c-b871-40f2-a5eb-80aa6b886d6c	IwIKs6	2026-04-14	11:00:00	90	Sztuczna inteligencja	mgr inż. K. Kiełkowicz	18	P4	laboratoria	aktywne
b0cff905-bc21-4afb-983a-1d3a08a1112d	IwIKs6	2026-04-14	12:45:00	90	Sztuczna inteligencja	mgr inż. K. Kiełkowicz	18	P2	laboratoria	aktywne
13addd74-a7cf-4707-9568-062914acfc20	IwIKs6	2026-04-14	16:15:00	90	Eksploracja danych	mgr inż. K. Czajkowski	202	Lk4 / P4	laboratoria	aktywne
d3757589-6368-4006-85ad-2f2241f803ac	IwIKs6	2026-04-14	18:00:00	90	Eksploracja danych	mgr inż. K. Czajkowski	A3	W	wykład	aktywne
8353517c-a69d-4b9b-93d2-d420320aedd6	IwIKs6	2026-04-15	11:45:00	90	Podstawy Internetu Rzeczy	dr inż. P. Król	18	P3	laboratoria	aktywne
ba24b445-dce8-4694-ac52-267a6c9b7a45	IwIKs6	2026-04-15	13:30:00	180	Ekonomiczno-prawne aspekty działalności inżynierskiej	dr M. Mikulec	A2	W	wykład	aktywne
549b2af3-98a1-44c3-93c9-85d89fd68ac8	IwIKs6	2026-04-15	17:00:00	90	Bezpieczeństwo systemów komputerowych	mgr inż. K. Kopera	101B	Lk1	laboratoria	aktywne
26c7f36c-ec14-4950-bd29-30164e7b285a	IwIKs6	2026-04-15	18:45:00	90	Bezpieczeństwo systemów komputerowych	mgr inż. K. Kopera	101B	Lk4	laboratoria	aktywne
a56d8930-ed8d-414c-8bf0-85c9ee3ac7ec	IwIKs6	2026-04-16	09:15:00	90	Komputerowe systemy sterowania	dr inż. G. Pędrak	11	P2	laboratoria	aktywne
acf05b08-c1c5-4be4-a9ab-e9c18777b9f9	IwIKs6	2026-04-16	11:00:00	90	Komputerowe systemy sterowania	dr inż. G. Pędrak	11	P4	laboratoria	aktywne
d1c91767-9e02-4fdd-ac77-fdb826b3041a	IwIKs6	2026-04-16	12:45:00	90	Podstawy Internetu Rzeczy	dr inż. P. Król	18	Lk1	laboratoria	aktywne
2a5b6167-acd4-4fbc-870d-34fc51e673dc	IwIKs6	2026-04-16	12:45:00	90	Komputerowe systemy sterowania	dr inż. G. Pędrak	11	L4	laboratoria	aktywne
037f4e45-2f61-4876-a587-e8219ff1d35c	IwIKs6	2026-04-16	14:30:00	90	Podstawy Internetu Rzeczy	dr inż. P. Król	18	Lk2	laboratoria	aktywne
f9289fd5-b69c-4332-bff8-96b376467dda	IwIKs6	2026-04-16	14:30:00	90	Komputerowe systemy sterowania	dr inż. G. Pędrak	11	L5	laboratoria	aktywne
691094ad-7481-4de3-99f7-004cfb2f902e	IwIKs6	2026-04-16	16:15:00	90	Podstawy Internetu Rzeczy	dr inż. P. Król	18	Lk3	laboratoria	aktywne
433d405e-9d4e-48c3-9a3b-693d267e70e0	IwIKs6	2026-04-16	18:00:00	90	Podstawy Internetu Rzeczy	dr inż. P. Król	18	Lk4	laboratoria	aktywne
03fb1fcc-eafb-43d2-a9ca-4f198ebbb0a0	IwIKs6	2026-04-17	09:15:00	90	Komputerowe systemy sterowania	dr inż. K. Schiff	11	L1	laboratoria	aktywne
4a35ac23-53a6-4367-9386-e418c6d9848b	IwIKs6	2026-04-17	11:00:00	90	Komputerowe systemy sterowania	dr inż. K. Schiff	11	L2	laboratoria	aktywne
761bba1a-d4fe-41e1-a048-7a4f25a48909	IwIKs6	2026-04-17	12:45:00	90	Komputerowe systemy sterowania	dr inż. K. Schiff	11	L3	laboratoria	aktywne
430c3247-f283-45b3-a805-48c952f8ff9a	IwIKs6	2026-04-17	14:30:00	90	Komputerowe systemy sterowania	dr inż. K. Schiff	A3	W	wykład	aktywne
d579e26d-239a-4fbc-8f1f-0fcfbc449692	IwIKs6	2026-04-20	07:30:00	90	Bezpieczeństwo systemów komputerowych	dr inż. A. Suchenia	A3	W	wykład	aktywne
c98e8349-daa8-4759-8a48-0461348c47ad	IwIKs6	2026-04-20	09:15:00	90	Sztuczna inteligencja	mgr inż. J. Krupiński	18	Lk3	laboratoria	aktywne
04b32d61-9b91-441c-802b-b0a54047fbaa	IwIKs6	2026-04-20	11:00:00	90	Bezpieczeństwo systemów komputerowych	dr inż. A. Suchenia	101B	P1	laboratoria	aktywne
f5c7587e-49c5-4807-85e7-b333690dcab8	IwIKs6	2026-04-20	11:00:00	90	Sztuczna inteligencja	mgr inż. J. Krupiński	18	Lk2	laboratoria	aktywne
ed45c6c0-aadf-44e3-94ae-782e55fd01e4	IwIKs6	2026-04-20	12:45:00	90	Bezpieczeństwo systemów komputerowych	dr inż. A. Suchenia	101B	P2	laboratoria	aktywne
bc71dc5d-33d6-431f-aecf-a03a2a2a7d3d	IwIKs6	2026-04-20	12:45:00	90	Sztuczna inteligencja	mgr inż. J. Krupiński	18	Lk1	laboratoria	aktywne
56a7e629-e332-4809-9daf-f61f3bf81f32	IwIKs6	2026-04-20	14:30:00	90	Sztuczna inteligencja	mgr inż. J. Krupiński	18	Lk4	laboratoria	aktywne
f209bc29-29bb-4d4d-9b53-9ab404acf5fb	IwIKs6	2026-04-20	16:15:00	90	Eksploracja danych	mgr inż. K. Czajkowski	201	Lk1 / P1	laboratoria	aktywne
a7c341d3-2a00-4d35-ac38-048ae460f884	IwIKs6	2026-04-20	18:00:00	90	Eksploracja danych	mgr inż. K. Czajkowski	201	Lk2 / P2	laboratoria	aktywne
564c981a-549c-40c7-a2ab-b0300e1046ae	IwIKs6	2026-04-20	18:00:00	90	Bezpieczeństwo systemów komputerowych	mgr inż. K. Kopera	101B	Lk3	laboratoria	aktywne
b47ab81d-f449-494e-bbc0-2d04d03d1495	IwIKs6	2026-04-20	19:45:00	90	Eksploracja danych	mgr inż. K. Czajkowski	201	Lk3 / P3	laboratoria	aktywne
d4639e99-115c-41ea-9ad9-d30efddb2f11	IwIKs6	2026-04-20	19:45:00	90	Bezpieczeństwo systemów komputerowych	mgr inż. K. Kopera	101B	Lk2	laboratoria	aktywne
484aab15-ceee-4afd-ae80-f2626cbe66ed	IwIKs6	2026-04-21	09:15:00	90	Sztuczna inteligencja	prof. Z. Kokosiński / mgr inż. K. Kiełkowicz	A3	W	wykład	aktywne
a38fccc9-dc83-42b7-944a-62e21e8a9651	IwIKs6	2026-04-21	11:00:00	90	Sztuczna inteligencja	mgr inż. K. Kiełkowicz	18	P3	laboratoria	aktywne
efe6b287-c65f-4d46-808f-2083e61cc254	IwIKs6	2026-04-21	12:45:00	90	Sztuczna inteligencja	mgr inż. K. Kiełkowicz	18	P1	laboratoria	aktywne
405d7323-286b-4b0a-b811-dfb3bf597fa5	IwIKs6	2026-04-21	14:30:00	90	Podstawy Internetu Rzeczy	dr inż. P. Król	A1	W	wykład	aktywne
fb0a78e2-d560-44aa-bed6-ea8bdfa73d6d	IwIKs6	2026-04-21	16:15:00	90	Eksploracja danych	mgr inż. K. Czajkowski	202	Lk4 / P4	laboratoria	aktywne
fb75fe28-77f8-4190-a8c1-18aff84819bc	IwIKs6	2026-04-21	18:00:00	90	Eksploracja danych	mgr inż. K. Czajkowski	A3	W	wykład	aktywne
074d4432-33a8-4522-850b-f135d7a47f6e	IwIKs6	2026-04-22	11:45:00	90	Podstawy Internetu Rzeczy	dr inż. P. Król	18	P3	laboratoria	aktywne
58f6d6ea-a0cc-406d-8958-33bed07f4a4b	IwIKs6	2026-04-22	13:30:00	90	Podstawy Internetu Rzeczy	dr inż. P. Król	18	P2	laboratoria	aktywne
9007d186-9cea-42c5-9e48-182344a1887e	IwIKs6	2026-04-22	15:15:00	90	Podstawy Internetu Rzeczy	dr inż. P. Król	18	P1	laboratoria	aktywne
11795004-4f29-4258-8219-c58f8eeabb96	IwIKs6	2026-04-22	17:00:00	90	Podstawy Internetu Rzeczy	dr inż. P. Król	18	P4	laboratoria	aktywne
e620c3cd-3da8-4e4d-bab4-57aba23277ae	IwIKs6	2026-04-22	17:00:00	90	Bezpieczeństwo systemów komputerowych	mgr inż. K. Kopera	101B	Lk1	laboratoria	aktywne
13fd0d3b-41aa-41da-91c5-a85ae67be339	IwIKs6	2026-04-22	18:45:00	90	Bezpieczeństwo systemów komputerowych	mgr inż. K. Kopera	101B	Lk4	laboratoria	aktywne
37178b89-970c-4fdc-bb45-f2acb0c83c18	IwIKs6	2026-04-23	09:15:00	90	Komputerowe systemy sterowania	dr inż. G. Pędrak	11	P1	laboratoria	aktywne
27dcd7d8-eade-4f69-bbad-68f1a12fe425	IwIKs6	2026-04-23	11:00:00	90	Komputerowe systemy sterowania	dr inż. G. Pędrak	11	P3	laboratoria	aktywne
12097a16-e3a0-4251-9264-0d14359fcb6e	IwIKs6	2026-04-23	12:45:00	90	Podstawy Internetu Rzeczy	dr inż. P. Król	18	Lk1	laboratoria	aktywne
413b8e8a-3f2f-42de-ab6e-df95e406484d	IwIKs6	2026-04-23	12:45:00	90	Komputerowe systemy sterowania	dr inż. G. Pędrak	11	L4	laboratoria	aktywne
c6c7721c-2143-4bce-b301-713bb1fcf5fc	IwIKs6	2026-04-23	14:30:00	90	Podstawy Internetu Rzeczy	dr inż. P. Król	18	Lk2	laboratoria	aktywne
77d7051e-a2f3-4138-8540-39d28dbfde64	IwIKs6	2026-04-23	14:30:00	90	Komputerowe systemy sterowania	dr inż. G. Pędrak	11	L5	laboratoria	aktywne
d74605c3-001a-4173-a822-22182b785d99	IwIKs6	2026-04-23	16:15:00	90	Podstawy Internetu Rzeczy	dr inż. P. Król	18	Lk3	laboratoria	aktywne
81ca14a3-d879-437b-9bb2-5116eb0cc88f	IwIKs6	2026-04-23	18:00:00	90	Podstawy Internetu Rzeczy	dr inż. P. Król	18	Lk4	laboratoria	aktywne
13cf2e2a-ec78-4346-9b8d-a3396b6994fd	IwIKs6	2026-04-24	09:15:00	90	Komputerowe systemy sterowania	dr inż. K. Schiff	11	L1	laboratoria	aktywne
6b7a86de-65ad-455c-aed6-d99f00a15430	IwIKs6	2026-04-24	11:00:00	90	Komputerowe systemy sterowania	dr inż. K. Schiff	11	L2	laboratoria	aktywne
0a055c54-b87a-4765-9f71-bf384b1caa46	IwIKs6	2026-04-24	12:45:00	90	Komputerowe systemy sterowania	dr inż. K. Schiff	11	L3	laboratoria	aktywne
078e77a7-1ed2-4f2f-9308-ed13cdd34724	IwIKs6	2026-04-24	14:30:00	90	Komputerowe systemy sterowania	dr inż. K. Schiff	A3	W	wykład	aktywne
6d488a54-7164-4a55-888f-d5c3714e0176	IwIKs6	2026-04-27	07:30:00	90	Bezpieczeństwo systemów komputerowych	dr inż. A. Suchenia	A3	W	wykład	aktywne
83c2155f-87ad-4028-bf31-ffa406553501	IwIKs6	2026-04-27	09:15:00	90	Sztuczna inteligencja	mgr inż. J. Krupiński	18	Lk3	laboratoria	aktywne
ff64087e-7b51-4f1a-88ac-e5228534a6b5	IwIKs6	2026-04-27	11:00:00	90	Bezpieczeństwo systemów komputerowych	dr inż. A. Suchenia	101B	P3	laboratoria	aktywne
2eb5f727-9abd-4d07-9445-035d0d64320a	IwIKs6	2026-04-27	11:00:00	90	Sztuczna inteligencja	mgr inż. J. Krupiński	18	Lk2	laboratoria	aktywne
ae454bb8-c762-49f3-9750-287fb94dda26	IwIKs6	2026-04-27	12:45:00	90	Bezpieczeństwo systemów komputerowych	dr inż. A. Suchenia	101B	P4	laboratoria	aktywne
2d83c956-2172-4417-993e-24bc8b1ab16a	IwIKs6	2026-04-27	12:45:00	90	Sztuczna inteligencja	mgr inż. J. Krupiński	18	Lk1	laboratoria	aktywne
5c6fc4a1-c128-4701-996e-62ffd6c0a9d5	IwIKs6	2026-04-27	14:30:00	90	Sztuczna inteligencja	mgr inż. J. Krupiński	18	Lk4	laboratoria	aktywne
210de769-7770-4cda-955a-412a33cdfc43	IwIKs6	2026-04-27	16:15:00	90	Eksploracja danych	mgr inż. K. Czajkowski	201	Lk1 / P1	laboratoria	aktywne
f3d5d5ca-21ce-48b7-98d4-612290c40d2e	IwIKs6	2026-04-27	18:00:00	90	Eksploracja danych	mgr inż. K. Czajkowski	201	Lk2 / P2	laboratoria	aktywne
0d7b2e21-b8e3-4fe4-978f-d432d794adb8	IwIKs6	2026-04-27	18:00:00	90	Bezpieczeństwo systemów komputerowych	mgr inż. K. Kopera	101B	Lk3	laboratoria	aktywne
7a206a6b-b36d-4a2f-9ddc-94a86280e0bc	IwIKs6	2026-04-27	19:45:00	90	Eksploracja danych	mgr inż. K. Czajkowski	201	Lk3 / P3	laboratoria	aktywne
2ae4ba77-0c09-4299-91fe-c05795b18c58	IwIKs6	2026-04-27	19:45:00	90	Bezpieczeństwo systemów komputerowych	mgr inż. K. Kopera	101B	Lk2	laboratoria	aktywne
d8a3de8c-83cc-42b4-af6a-9745ceb1b91d	IwIKs6	2026-04-28	09:15:00	90	Sztuczna inteligencja	prof. Z. Kokosiński / mgr inż. K. Kiełkowicz	A3	W	wykład	aktywne
4a259025-681e-46f2-92fb-7f8ab1a96210	IwIKs6	2026-04-28	11:00:00	90	Sztuczna inteligencja	mgr inż. K. Kiełkowicz	18	P4	laboratoria	aktywne
1aae426a-27f7-4808-8648-5322f72a22ea	IwIKs6	2026-04-28	12:45:00	90	Sztuczna inteligencja	mgr inż. K. Kiełkowicz	18	P2	laboratoria	aktywne
5af46a92-5b64-4f16-ae7c-d6642ae5697d	IwIKs6	2026-04-28	16:15:00	90	Eksploracja danych	mgr inż. K. Czajkowski	202	Lk4 / P4	laboratoria	aktywne
fb8fe025-10bc-45e4-880e-80aa580f07d5	IwIKs6	2026-04-28	18:00:00	90	Eksploracja danych	mgr inż. K. Czajkowski	A3	W	wykład	aktywne
303d18f4-7311-4b60-bdd3-bc9d8733e6c5	IwIKs6	2026-04-29	17:00:00	90	Bezpieczeństwo systemów komputerowych	mgr inż. K. Kopera	101B	Lk1	laboratoria	aktywne
8ca5926c-7734-4e75-afbd-93f3bba2deba	IwIKs6	2026-04-29	18:45:00	90	Bezpieczeństwo systemów komputerowych	mgr inż. K. Kopera	101B	Lk4	laboratoria	aktywne
df6f8910-96cd-490a-8ba3-24b2a9ce96ee	IwIKs6	2026-04-30	09:15:00	90	Komputerowe systemy sterowania	dr inż. G. Pędrak	11	P2	laboratoria	aktywne
e1d30a12-7177-4e2c-a6a8-616d16adb06d	IwIKs6	2026-04-30	11:00:00	90	Komputerowe systemy sterowania	dr inż. G. Pędrak	11	P4	laboratoria	aktywne
73beea33-772a-4961-9a6a-7272a1fcefb4	IwIKs6	2026-04-30	12:45:00	90	Podstawy Internetu Rzeczy	dr inż. P. Król	18	Lk1	laboratoria	aktywne
067362d7-a957-4787-b60b-1967c9a20310	IwIKs6	2026-04-30	12:45:00	90	Komputerowe systemy sterowania	dr inż. G. Pędrak	11	L4	laboratoria	aktywne
85a9737b-37ae-441e-b081-59e93a54150b	IwIKs6	2026-04-30	14:30:00	90	Podstawy Internetu Rzeczy	dr inż. P. Król	18	Lk2	laboratoria	aktywne
e5e5f43f-ec10-4051-b300-7a4ce21217e7	IwIKs6	2026-04-30	14:30:00	90	Komputerowe systemy sterowania	dr inż. G. Pędrak	11	L5	laboratoria	aktywne
80d5d62c-ca69-4108-8024-adafa7de20a9	IwIKs6	2026-04-30	16:15:00	90	Podstawy Internetu Rzeczy	dr inż. P. Król	18	Lk3	laboratoria	aktywne
ec166a5b-2693-421e-8464-a77603b06c1c	IwIKs6	2026-04-30	18:00:00	90	Podstawy Internetu Rzeczy	dr inż. P. Król	18	Lk4	laboratoria	aktywne
cd6f66f8-5a96-4fca-9218-87f9aa2f7552	IwIKs6	2026-05-01	07:00:00	900	Majówka	Brak	-	Wszystkie grupy	święto	wolne
fc17c3b3-cf7a-490c-90a1-3886c564698c	IwIKs6	2026-05-02	07:00:00	900	Majówka	Brak	-	Wszystkie grupy	święto	wolne
05bb33a4-6211-4f82-a55e-ec4c395aa442	IwIKs6	2026-05-03	07:00:00	900	Majówka	Brak	-	Wszystkie grupy	święto	wolne
6876aff0-7a72-4665-925c-0bcc05113f2f	IwIKs6	2026-05-04	07:00:00	900	Majówka	Brak	-	Wszystkie grupy	święto	wolne
e06b55bd-2c8e-42c8-81c0-25d8c4b97a4c	IwIKs6	2026-05-05	09:15:00	90	Sztuczna inteligencja	prof. Z. Kokosiński / mgr inż. K. Kiełkowicz	A3	W	wykład	aktywne
272cebba-6df4-492c-a067-510e350f0dc4	IwIKs6	2026-05-05	11:00:00	90	Sztuczna inteligencja	mgr inż. K. Kiełkowicz	18	P3	laboratoria	aktywne
6e919d4b-af37-48e3-9fdc-47f9c7fe07f7	IwIKs6	2026-05-05	12:45:00	90	Sztuczna inteligencja	mgr inż. K. Kiełkowicz	18	P1	laboratoria	aktywne
8fe16af4-2b9a-430c-b667-792225845e5f	IwIKs6	2026-05-05	14:30:00	90	Podstawy Internetu Rzeczy	dr inż. P. Król	A1	W	wykład	aktywne
f7c72203-8894-45cb-8bfd-56493cd631fe	IwIKs6	2026-05-05	16:15:00	90	Eksploracja danych	mgr inż. K. Czajkowski	202	Lk4 / P4	laboratoria	aktywne
35fc3042-08b7-41a8-a084-991424df1088	IwIKs6	2026-05-05	18:00:00	90	Eksploracja danych	mgr inż. K. Czajkowski	A3	W	wykład	aktywne
2692aefa-fdec-4596-a203-7cff757636c0	IwIKs6	2026-05-06	11:45:00	90	Podstawy Internetu Rzeczy	dr inż. P. Król	18	P3	laboratoria	aktywne
c2a126c5-ac2b-4192-a838-cae234e102eb	IwIKs6	2026-05-06	13:30:00	90	Podstawy Internetu Rzeczy	dr inż. P. Król	18	P2	laboratoria	aktywne
a3937ed9-f528-4cec-9027-d249e87da691	IwIKs6	2026-05-06	15:15:00	90	Podstawy Internetu Rzeczy	dr inż. P. Król	18	P1	laboratoria	aktywne
289f32df-a3e6-4756-af13-5b3f6ec8ccbf	IwIKs6	2026-05-06	17:00:00	90	Podstawy Internetu Rzeczy	dr inż. P. Król	18	P4	laboratoria	aktywne
b80703c3-aa53-4f93-bd9d-4c1de6287da8	IwIKs6	2026-05-06	17:00:00	90	Bezpieczeństwo systemów komputerowych	mgr inż. K. Kopera	101B	Lk1	laboratoria	aktywne
5510a33f-e052-403b-ba47-da2adadc67a3	IwIKs6	2026-05-06	18:45:00	90	Bezpieczeństwo systemów komputerowych	mgr inż. K. Kopera	101B	Lk4	laboratoria	aktywne
912b3406-9ff7-4219-a719-6ee3f0f05649	IwIKs6	2026-05-07	09:15:00	90	Komputerowe systemy sterowania	dr inż. G. Pędrak	11	P1	laboratoria	aktywne
052196de-73d4-490a-84af-1286e9000ad8	IwIKs6	2026-05-07	11:00:00	90	Komputerowe systemy sterowania	dr inż. G. Pędrak	11	P3	laboratoria	aktywne
10643d60-cfa7-4c06-9d68-84382fc2e9ef	IwIKs6	2026-05-07	12:45:00	90	Podstawy Internetu Rzeczy	dr inż. P. Król	18	Lk1	laboratoria	aktywne
4e9a7410-65e8-4f1e-a47a-14835b0ca3ff	IwIKs6	2026-05-07	12:45:00	90	Komputerowe systemy sterowania	dr inż. G. Pędrak	11	L4	laboratoria	aktywne
af766d80-4498-428d-8b1e-a714c9ef79bd	IwIKs6	2026-05-07	14:30:00	90	Podstawy Internetu Rzeczy	dr inż. P. Król	18	Lk2	laboratoria	aktywne
27ceb4f4-e162-4edb-b73c-69683a67f968	IwIKs6	2026-05-07	14:30:00	90	Komputerowe systemy sterowania	dr inż. G. Pędrak	11	L5	laboratoria	aktywne
fefa824f-a3fb-42a5-8a70-e722a20d4b64	IwIKs6	2026-05-07	16:15:00	90	Podstawy Internetu Rzeczy	dr inż. P. Król	18	Lk3	laboratoria	aktywne
4145903f-52fd-4080-b47f-d007b67006b2	IwIKs6	2026-05-07	18:00:00	90	Podstawy Internetu Rzeczy	dr inż. P. Król	18	Lk4	laboratoria	aktywne
193d6dee-df5d-44ea-a788-f3fbe32bf262	IwIKs6	2026-05-11	07:30:00	90	Bezpieczeństwo systemów komputerowych	dr inż. A. Suchenia	A3	W	wykład	aktywne
285200aa-d08d-4c43-a4b7-866d0ce9a4aa	IwIKs6	2026-05-11	09:15:00	90	Sztuczna inteligencja	mgr inż. J. Krupiński	18	Lk3	laboratoria	aktywne
807937f3-7970-444b-98e2-7dbc06ae7221	IwIKs6	2026-05-11	11:00:00	45	Bezpieczeństwo systemów komputerowych	dr inż. A. Suchenia	101B	P3	laboratoria	aktywne
265a03fb-2a8e-4eb0-aa30-85540748fe73	IwIKs6	2026-05-11	11:00:00	90	Sztuczna inteligencja	mgr inż. J. Krupiński	18	Lk2	laboratoria	aktywne
15a8b444-a2d6-4da7-80e1-09b80c73e232	IwIKs6	2026-05-11	11:45:00	45	Bezpieczeństwo systemów komputerowych	dr inż. A. Suchenia	101B	P4	laboratoria	aktywne
2bc9e6c2-0740-431e-aff1-cf423289f883	IwIKs6	2026-05-11	12:45:00	90	Sztuczna inteligencja	mgr inż. J. Krupiński	18	Lk1	laboratoria	aktywne
c4a628c6-4478-409a-8e6f-3de6eb8d9754	IwIKs6	2026-05-11	13:30:00	45	Bezpieczeństwo systemów komputerowych	dr inż. A. Suchenia	101B	P2	laboratoria	aktywne
5c69363d-b870-4928-97cb-fbee7d87bd5f	IwIKs6	2026-05-11	14:30:00	45	Bezpieczeństwo systemów komputerowych	dr inż. A. Suchenia	101B	P1	laboratoria	aktywne
026ba75b-e447-4d9e-a333-f399776307ec	IwIKs6	2026-05-11	14:30:00	90	Sztuczna inteligencja	mgr inż. J. Krupiński	18	Lk4	laboratoria	aktywne
98749b78-5fc9-4fcd-9ee7-07bf915abf37	IwIKs6	2026-05-11	16:15:00	90	Eksploracja danych	mgr inż. K. Czajkowski	201	Lk1 / P1	laboratoria	aktywne
e160bb22-b1ef-4657-a2df-3fb9925ce5c3	IwIKs6	2026-05-11	18:00:00	90	Eksploracja danych	mgr inż. K. Czajkowski	201	Lk2 / P2	laboratoria	aktywne
a4a8bd5e-a790-4824-959f-8ca5168357f9	IwIKs6	2026-05-11	18:00:00	90	Bezpieczeństwo systemów komputerowych	mgr inż. K. Kopera	101B	Lk3	laboratoria	aktywne
f6f16df0-e141-4dd4-bdc0-a7b3264562c7	IwIKs6	2026-05-11	19:45:00	90	Eksploracja danych	mgr inż. K. Czajkowski	201	Lk3 / P3	laboratoria	aktywne
0305271a-4723-4859-908f-851d99753ded	IwIKs6	2026-05-11	19:45:00	90	Bezpieczeństwo systemów komputerowych	mgr inż. K. Kopera	101B	Lk2	laboratoria	aktywne
aa83aff7-73dc-4d88-bf31-99a2d08f3831	IwIKs6	2026-05-12	07:00:00	900	Święto Szkoły	Brak	-	Wszystkie grupy	święto	wolne
2d92bacb-0510-4fcb-b854-66b0d97793bb	IwIKs6	2026-05-13	17:00:00	90	Bezpieczeństwo systemów komputerowych	mgr inż. K. Kopera	101B	Lk1	laboratoria	aktywne
5961d8c0-5dcd-4a70-871d-b9d553c665ab	IwIKs6	2026-05-13	18:45:00	90	Bezpieczeństwo systemów komputerowych	mgr inż. K. Kopera	101B	Lk4	laboratoria	aktywne
9a5f051e-02db-4ca8-8402-7b8afbfb43c2	IwIKs6	2026-05-14	09:15:00	90	Komputerowe systemy sterowania	dr inż. G. Pędrak	11	P2	laboratoria	aktywne
4444cb63-0436-4502-80b5-51db543547f8	IwIKs6	2026-05-14	11:00:00	90	Komputerowe systemy sterowania	dr inż. G. Pędrak	11	P4	laboratoria	aktywne
92d7a8ef-9069-4f71-81fa-1ad5c2cc2eaa	IwIKs6	2026-05-14	12:45:00	90	Podstawy Internetu Rzeczy	dr inż. P. Król	18	Lk1	laboratoria	aktywne
0aee36ce-f46f-4e6e-b77b-e4ce93eacfc9	IwIKs6	2026-05-14	12:45:00	90	Komputerowe systemy sterowania	dr inż. G. Pędrak	11	L4	laboratoria	aktywne
72e3991a-ff17-4cb8-85df-408e50e29ef6	IwIKs6	2026-05-14	14:30:00	90	Podstawy Internetu Rzeczy	dr inż. P. Król	18	Lk2	laboratoria	aktywne
78eb2b66-3686-4201-99b0-a81a02cd77fa	IwIKs6	2026-05-14	14:30:00	90	Komputerowe systemy sterowania	dr inż. G. Pędrak	11	L5	laboratoria	aktywne
5a5ec642-5dfb-4f58-94cf-b4b083a4f490	IwIKs6	2026-05-14	16:15:00	90	Podstawy Internetu Rzeczy	dr inż. P. Król	18	Lk3	laboratoria	aktywne
f0995187-e0e2-49ba-b82f-51261af17a59	IwIKs6	2026-05-14	18:00:00	90	Podstawy Internetu Rzeczy	dr inż. P. Król	18	Lk4	laboratoria	aktywne
5c8a1593-64e5-4129-85c1-020fda5153e6	IwIKs6	2026-05-15	09:15:00	90	Komputerowe systemy sterowania	dr inż. K. Schiff	11	L1	laboratoria	aktywne
53cf640e-7da2-40c5-bc6f-e296fed13f4d	IwIKs6	2026-05-15	11:00:00	90	Komputerowe systemy sterowania	dr inż. K. Schiff	11	L2	laboratoria	aktywne
158fbc74-4c58-45bf-a33a-a5bdc6b3ce84	IwIKs6	2026-05-15	12:45:00	90	Komputerowe systemy sterowania	dr inż. K. Schiff	11	L3	laboratoria	aktywne
c45107f1-d030-47af-b081-9b1363f53e19	IwIKs6	2026-05-15	14:30:00	90	Komputerowe systemy sterowania	dr inż. K. Schiff	A3	W	wykład	aktywne
ed49ebf7-ecec-4483-9440-5789f7ed10c2	IwIKs6	2026-05-18	11:00:00	90	Bezpieczeństwo systemów komputerowych	dr inż. A. Suchenia	101B	P1	laboratoria	aktywne
8efb6547-340b-4fbc-8ce9-30aafe66375e	IwIKs6	2026-05-18	12:45:00	90	Bezpieczeństwo systemów komputerowych	dr inż. A. Suchenia	101B	P2	laboratoria	aktywne
2aa86fe4-37b7-42b4-b33c-a1ad02ad173a	IwIKs6	2026-05-18	16:15:00	90	Eksploracja danych	mgr inż. K. Czajkowski	201	Lk1 / P1	laboratoria	aktywne
5b98f4f2-d858-4dd5-8c68-a24af9c8084c	IwIKs6	2026-05-18	18:00:00	90	Eksploracja danych	mgr inż. K. Czajkowski	201	Lk2 / P2	laboratoria	aktywne
690c6334-513c-4f95-9a0c-8ee59d1abd83	IwIKs6	2026-05-18	18:00:00	90	Bezpieczeństwo systemów komputerowych	mgr inż. K. Kopera	101B	Lk3	laboratoria	aktywne
fa3369a2-8b44-4884-91b4-e3246c93a3d6	IwIKs6	2026-05-18	19:45:00	90	Eksploracja danych	mgr inż. K. Czajkowski	201	Lk3 / P3	laboratoria	aktywne
6d6e3010-92ca-4e7b-b3b5-a3d169a0ca41	IwIKs6	2026-05-18	19:45:00	90	Bezpieczeństwo systemów komputerowych	mgr inż. K. Kopera	101B	Lk2	laboratoria	aktywne
eddb9790-8fee-4078-a09e-055e6517a357	IwIKs6	2026-05-19	11:00:00	90	Ekonomiczno-prawne aspekty działalności inżynierskiej	dr M. Mikulec	10	S1	laboratoria	aktywne
935aa31c-6bab-433c-a2fc-be3dccf4a105	IwIKs6	2026-05-19	12:45:00	90	Ekonomiczno-prawne aspekty działalności inżynierskiej	dr M. Mikulec	10	S2	laboratoria	aktywne
31d6ed6a-063e-42b0-88ba-d4b86f328a15	IwIKs6	2026-05-19	14:30:00	90	Podstawy Internetu Rzeczy	dr inż. P. Król	A1	W	wykład	aktywne
8031e7a5-0061-4e9c-83e6-1bfb2b12cfb1	IwIKs6	2026-05-19	16:15:00	90	Eksploracja danych	mgr inż. K. Czajkowski	202	Lk4 / P4	laboratoria	aktywne
26c76ebd-3667-429d-ae53-7bf9e40e818b	IwIKs6	2026-05-20	11:45:00	90	Podstawy Internetu Rzeczy	dr inż. P. Król	18	P3	laboratoria	aktywne
524d7abe-f94b-4a64-9e6d-14a8940df2f0	IwIKs6	2026-05-20	13:30:00	90	Podstawy Internetu Rzeczy	dr inż. P. Król	18	P2	laboratoria	aktywne
23757c2f-e33e-492b-8923-8ac08a8d41f1	IwIKs6	2026-05-20	15:15:00	90	Podstawy Internetu Rzeczy	dr inż. P. Król	18	P1	laboratoria	aktywne
a4c8709b-e85e-4c52-8382-67189c65076e	IwIKs6	2026-05-20	17:00:00	90	Podstawy Internetu Rzeczy	dr inż. P. Król	18	P4	laboratoria	aktywne
1b66ea35-3858-4a55-83c2-cffdce630f43	IwIKs6	2026-05-20	17:00:00	90	Bezpieczeństwo systemów komputerowych	mgr inż. K. Kopera	101B	Lk1	laboratoria	aktywne
0c7148e0-4161-44d5-9faa-9fc17ac2afbc	IwIKs6	2026-05-20	18:45:00	90	Bezpieczeństwo systemów komputerowych	mgr inż. K. Kopera	101B	Lk4	laboratoria	aktywne
0cb5998b-a0e7-4721-8849-93df2a5723f9	IwIKs6	2026-05-21	09:15:00	90	Komputerowe systemy sterowania	dr inż. G. Pędrak	11	P1	laboratoria	aktywne
f4c67b0d-4375-4bc0-a228-c6d2789d3a49	IwIKs6	2026-05-21	11:00:00	90	Komputerowe systemy sterowania	dr inż. G. Pędrak	11	P3	laboratoria	aktywne
824abc71-92c3-4274-85f6-c685298fb587	IwIKs6	2026-05-21	12:45:00	90	Podstawy Internetu Rzeczy	dr inż. P. Król	18	Lk1	laboratoria	aktywne
09b9d205-1edf-4e06-87ab-620b2a739c0d	IwIKs6	2026-05-21	12:45:00	90	Komputerowe systemy sterowania	dr inż. G. Pędrak	11	L4	laboratoria	aktywne
2cc7b2b9-c11d-42b0-b077-b3cf4e07bad2	IwIKs6	2026-05-21	14:30:00	90	Podstawy Internetu Rzeczy	dr inż. P. Król	18	Lk2	laboratoria	aktywne
c83af7d6-8691-48a9-af3c-a944e98d3ae9	IwIKs6	2026-05-21	14:30:00	90	Komputerowe systemy sterowania	dr inż. G. Pędrak	11	L5	laboratoria	aktywne
7e2ed142-1ef3-491d-a991-df063f120e02	IwIKs6	2026-05-21	16:15:00	90	Podstawy Internetu Rzeczy	dr inż. P. Król	18	Lk3	laboratoria	aktywne
b3fe5785-a4bc-48de-b559-ddb0c3368361	IwIKs6	2026-05-21	18:00:00	90	Podstawy Internetu Rzeczy	dr inż. P. Król	18	Lk4	laboratoria	aktywne
0049e827-529e-4132-ac6c-400f63c0860a	IwIKs6	2026-05-22	09:15:00	135	Komputerowe systemy sterowania	dr inż. K. Schiff	11	L1	laboratoria	aktywne
25bb3024-6ce4-4269-b00e-900f3b184d27	IwIKs6	2026-05-22	11:45:00	135	Komputerowe systemy sterowania	dr inż. K. Schiff	11	L2	laboratoria	aktywne
6eb425da-1034-49b2-8406-a3e38a9583d9	IwIKs6	2026-05-22	14:15:00	135	Komputerowe systemy sterowania	dr inż. K. Schiff	11	L3	laboratoria	aktywne
6c552a47-0392-47c3-80d4-ee68457a182c	IwIKs6	2026-05-24	07:00:00	900	Zielone Świątki	Brak	-	Wszystkie grupy	święto	wolne
eb0ae778-1b4e-48d2-ae32-3ef8bb84bce4	IwIKs6	2026-05-25	11:00:00	90	Bezpieczeństwo systemów komputerowych	dr inż. A. Suchenia	101B	P3	laboratoria	aktywne
e9617bb9-9eef-4720-bf01-c16f751f49c5	IwIKs6	2026-05-25	12:45:00	90	Bezpieczeństwo systemów komputerowych	dr inż. A. Suchenia	101B	P4	laboratoria	aktywne
a1d644a6-e04b-42bd-b6d6-b434e95e42c4	IwIKs6	2026-05-25	16:15:00	90	Eksploracja danych	mgr inż. K. Czajkowski	201	Lk1 / P1	laboratoria	aktywne
69fe734c-eb18-40f4-ad35-93d9198c8e7f	IwIKs6	2026-05-25	18:00:00	90	Eksploracja danych	mgr inż. K. Czajkowski	201	Lk2 / P2	laboratoria	aktywne
ae67b028-700b-4e56-9541-9ffa93ed4755	IwIKs6	2026-05-25	18:00:00	90	Bezpieczeństwo systemów komputerowych	mgr inż. K. Kopera	101B	Lk3	laboratoria	aktywne
2b453c16-a24b-4fbe-a3c0-f239086afeb4	IwIKs6	2026-05-25	19:45:00	90	Eksploracja danych	mgr inż. K. Czajkowski	201	Lk3 / P3	laboratoria	aktywne
861efbac-1f23-4bc6-9498-9115a8807480	IwIKs6	2026-05-25	19:45:00	90	Bezpieczeństwo systemów komputerowych	mgr inż. K. Kopera	101B	Lk2	laboratoria	aktywne
9f0a3927-ce23-4d80-9506-01b9ed28e5ed	IwIKs6	2026-05-26	10:15:00	90	Ekonomiczno-prawne aspekty działalności inżynierskiej	dr M. Mikulec	10	S1	laboratoria	aktywne
b7cfd88e-403a-4269-9227-5f1942d4d992	IwIKs6	2026-05-26	12:00:00	90	Ekonomiczno-prawne aspekty działalności inżynierskiej	dr M. Mikulec	10	S2	laboratoria	aktywne
8a6c141d-0e4c-4d92-b71a-e357bd0a5e98	IwIKs6	2026-05-26	13:45:00	135	Ekonomiczno-prawne aspekty działalności inżynierskiej	dr M. Mikulec	10	W	wykład	aktywne
375bc9cb-6f33-481e-b59e-e764bc4c92fb	IwIKs6	2026-05-26	16:15:00	90	Eksploracja danych	mgr inż. K. Czajkowski	202	Lk4 / P4	laboratoria	aktywne
0a9e7b4e-6384-47a5-a661-05d717a4ceaf	IwIKs6	2026-05-27	11:45:00	90	Podstawy Internetu Rzeczy	dr inż. P. Król	18	P3	laboratoria	aktywne
55a996b0-33df-4b93-8b07-881b52a9a34d	IwIKs6	2026-05-27	13:30:00	90	Podstawy Internetu Rzeczy	dr inż. P. Król	18	P2	laboratoria	aktywne
305390c2-a26a-4590-92f9-051b675b4670	IwIKs6	2026-05-27	15:15:00	90	Podstawy Internetu Rzeczy	dr inż. P. Król	18	P1	laboratoria	aktywne
61c2471a-218e-401b-b31d-70ef4a4752a5	IwIKs6	2026-05-27	17:00:00	90	Podstawy Internetu Rzeczy	dr inż. P. Król	18	P4	laboratoria	aktywne
ac7f56a4-cba1-45db-8557-7f9ac6b1b354	IwIKs6	2026-05-27	17:00:00	90	Bezpieczeństwo systemów komputerowych	mgr inż. K. Kopera	101B	Lk1	laboratoria	aktywne
ab1d525a-5f6d-42b4-b9cc-3b44f1067daa	IwIKs6	2026-05-27	18:45:00	90	Bezpieczeństwo systemów komputerowych	mgr inż. K. Kopera	101B	Lk4	laboratoria	aktywne
851009f6-0d17-495f-b863-cd26a7e47d1f	IwIKs6	2026-05-28	09:15:00	90	Komputerowe systemy sterowania	dr inż. G. Pędrak	11	P2	laboratoria	aktywne
aa4797c0-6823-4bec-911d-f4899604450f	IwIKs6	2026-05-28	11:00:00	90	Komputerowe systemy sterowania	dr inż. G. Pędrak	11	P4	laboratoria	aktywne
635912b6-e2b4-4be1-ac21-5c1dc110fcf0	IwIKs6	2026-05-28	12:45:00	90	Podstawy Internetu Rzeczy	dr inż. P. Król	18	Lk1	laboratoria	aktywne
e11f297d-c549-4936-ae48-f8131921e5bb	IwIKs6	2026-05-28	12:45:00	90	Komputerowe systemy sterowania	dr inż. G. Pędrak	11	L4	laboratoria	aktywne
ffb7fc37-8e4c-4b72-bc8d-f1fb6e06cfbf	IwIKs6	2026-05-28	14:30:00	90	Podstawy Internetu Rzeczy	dr inż. P. Król	18	Lk2	laboratoria	aktywne
41e0fbc3-1252-4964-90c7-dc70f0362489	IwIKs6	2026-05-28	14:30:00	90	Komputerowe systemy sterowania	dr inż. G. Pędrak	11	L5	laboratoria	aktywne
62ed3f66-47ee-4152-b4c8-d58cc18aaadd	IwIKs6	2026-05-28	16:15:00	90	Podstawy Internetu Rzeczy	dr inż. P. Król	18	Lk3	laboratoria	aktywne
a82646e7-064c-4ac7-84b0-afc4675c7bb9	IwIKs6	2026-05-28	18:00:00	90	Podstawy Internetu Rzeczy	dr inż. P. Król	18	Lk4	laboratoria	aktywne
2b7f848f-3f31-4678-83e8-b45473dbf168	IwIKs6	2026-05-29	09:15:00	135	Komputerowe systemy sterowania	dr inż. K. Schiff	11	L1	laboratoria	aktywne
60593b72-8797-4c41-917c-3f6ddca4f001	IwIKs6	2026-05-29	11:45:00	135	Komputerowe systemy sterowania	dr inż. K. Schiff	11	L2	laboratoria	aktywne
7f961f25-6909-47a4-84ea-e20e3d0c646f	IwIKs6	2026-05-29	14:15:00	135	Komputerowe systemy sterowania	dr inż. K. Schiff	11	L3	laboratoria	aktywne
da867642-18b0-4700-a138-f922aaf3b411	IwIKs6	2026-06-01	11:00:00	90	Bezpieczeństwo systemów komputerowych	dr inż. A. Suchenia	101B	P1	laboratoria	aktywne
7eb6ce22-45bc-401d-b3e1-d64269ad8a57	IwIKs6	2026-06-01	12:45:00	90	Bezpieczeństwo systemów komputerowych	dr inż. A. Suchenia	101B	P2	laboratoria	aktywne
77f2127c-8b4f-4012-a05a-ee6d733960f2	IwIKs6	2026-06-01	16:15:00	90	Eksploracja danych	mgr inż. K. Czajkowski	201	Lk1 / P1	laboratoria	aktywne
8530f882-ea8d-458e-9ea3-7c147456e55b	IwIKs6	2026-06-01	18:00:00	90	Eksploracja danych	mgr inż. K. Czajkowski	201	Lk2 / P2	laboratoria	aktywne
86e38dfc-bcaa-45a8-99df-ad909625656d	IwIKs6	2026-06-01	18:00:00	90	Bezpieczeństwo systemów komputerowych	mgr inż. K. Kopera	101B	Lk3	laboratoria	aktywne
a57ce548-3826-46e9-8371-fee711311508	IwIKs6	2026-06-01	19:45:00	90	Eksploracja danych	mgr inż. K. Czajkowski	201	Lk3 / P3	laboratoria	aktywne
d71d408f-17c7-40c0-84e0-50a330e37ab4	IwIKs6	2026-06-01	19:45:00	90	Bezpieczeństwo systemów komputerowych	mgr inż. K. Kopera	101B	Lk2	laboratoria	aktywne
fc44cd75-babb-402b-bba9-83f5fe5adcc5	IwIKs6	2026-06-02	09:15:00	90	Ekonomiczno-prawne aspekty działalności inżynierskiej	dr M. Mikulec	10	S1	laboratoria	aktywne
9449add9-212d-4401-a53c-8d192bc85c8d	IwIKs6	2026-06-02	11:00:00	90	Ekonomiczno-prawne aspekty działalności inżynierskiej	dr M. Mikulec	10	S2	laboratoria	aktywne
0afb4588-667d-4a6d-aefe-128103c358e8	IwIKs6	2026-06-02	14:30:00	90	Podstawy Internetu Rzeczy	dr inż. P. Król	A1	W	wykład	aktywne
f4a15d12-11f3-462d-a5aa-2bf033678eec	IwIKs6	2026-06-02	16:15:00	90	Eksploracja danych	mgr inż. K. Czajkowski	202	Lk4 / P4	laboratoria	aktywne
878358f3-5723-4ffb-9505-0e5af6087f79	IwIKs6	2026-06-03	11:45:00	90	Podstawy Internetu Rzeczy	dr inż. P. Król	18	P3	laboratoria	aktywne
bbec7a7d-3b8d-4fa8-afe5-1ad7ae52516c	IwIKs6	2026-06-03	13:30:00	90	Podstawy Internetu Rzeczy	dr inż. P. Król	18	P2	laboratoria	aktywne
36c1fa33-1881-4aa3-b2b5-f27578f739a0	IwIKs6	2026-06-03	15:15:00	90	Podstawy Internetu Rzeczy	dr inż. P. Król	18	P1	laboratoria	aktywne
00eec894-3ec6-46de-ab57-357d49ffd9e6	IwIKs6	2026-06-03	17:00:00	90	Podstawy Internetu Rzeczy	dr inż. P. Król	18	P4	laboratoria	aktywne
54f9103d-2bcb-4e21-977a-0ff09c63a665	IwIKs6	2026-06-03	17:00:00	90	Bezpieczeństwo systemów komputerowych	mgr inż. K. Kopera	101B	Lk1	laboratoria	aktywne
41122d32-941f-4280-b205-65e5a6225b6b	IwIKs6	2026-06-03	18:45:00	90	Bezpieczeństwo systemów komputerowych	mgr inż. K. Kopera	101B	Lk4	laboratoria	aktywne
06e5ce84-24cb-418b-9970-9832625d1643	IwIKs6	2026-06-04	07:00:00	900	Boże Ciało	Brak	-	Wszystkie grupy	święto	wolne
bda08d41-0515-4a1f-8a7f-305a2971e357	IwIKs6	2026-06-05	07:00:00	900	Boże Ciało	Brak	-	Wszystkie grupy	święto	wolne
7a61d771-8c80-4f06-9ee4-3f1143a2a1d0	IwIKs6	2026-06-08	11:00:00	90	Bezpieczeństwo systemów komputerowych	dr inż. A. Suchenia	101B	P3	laboratoria	aktywne
b8a8a016-b6df-460d-be69-7a692d9def12	IwIKs6	2026-06-08	12:45:00	90	Bezpieczeństwo systemów komputerowych	dr inż. A. Suchenia	101B	P4	laboratoria	aktywne
2d79d5d0-641b-46cd-b46b-54c4b59f0570	IwIKs6	2026-06-08	16:15:00	90	Eksploracja danych	mgr inż. K. Czajkowski	201	Lk1 / P1	laboratoria	aktywne
d6122c77-6d89-4e19-98f0-22ff02339c72	IwIKs6	2026-06-08	18:00:00	90	Eksploracja danych	mgr inż. K. Czajkowski	201	Lk2 / P2	laboratoria	aktywne
fa0692be-8b61-437d-8396-7f79e5042cf7	IwIKs6	2026-06-08	18:00:00	90	Bezpieczeństwo systemów komputerowych	mgr inż. K. Kopera	101B	Lk3	laboratoria	aktywne
d4cf7528-7e8c-4b09-8b2a-bb5af4fc6db5	IwIKs6	2026-06-08	19:45:00	90	Eksploracja danych	mgr inż. K. Czajkowski	201	Lk3 / P3	laboratoria	aktywne
5afcf142-1c43-4bcc-bb46-5b5a220c27e5	IwIKs6	2026-06-08	19:45:00	90	Bezpieczeństwo systemów komputerowych	mgr inż. K. Kopera	101B	Lk2	laboratoria	aktywne
464f0cdc-e483-4e38-9aec-66320d401199	IwIKs6	2026-06-09	16:15:00	90	Eksploracja danych	mgr inż. K. Czajkowski	202	Lk4 / P4	laboratoria	aktywne
64666374-2324-41d4-9348-ebaec96228aa	IwIKs6	2026-06-10	13:30:00	90	Podstawy Internetu Rzeczy	dr inż. P. Król	18	P2	laboratoria	aktywne
1a36baa5-9976-459e-87b5-f622d90e7312	IwIKs6	2026-06-10	15:15:00	90	Podstawy Internetu Rzeczy	dr inż. P. Król	18	P1	laboratoria	aktywne
72def016-3580-480d-8d65-3b0dc06b58ea	IwIKs6	2026-06-10	17:00:00	90	Podstawy Internetu Rzeczy	dr inż. P. Król	18	P4	laboratoria	aktywne
e113c668-3c7c-4c68-91b8-dcacb9a097f7	IwIKs6	2026-06-10	17:00:00	90	Bezpieczeństwo systemów komputerowych	mgr inż. K. Kopera	101B	Lk1	laboratoria	aktywne
dedd6ec5-93a9-43bc-91b4-4c854364c479	IwIKs6	2026-06-10	18:45:00	90	Bezpieczeństwo systemów komputerowych	mgr inż. K. Kopera	101B	Lk4	laboratoria	aktywne
b5ef6b19-8b71-453a-9bbb-0c6745844f6c	IwIKs6	2026-06-11	09:15:00	90	Komputerowe systemy sterowania	dr inż. G. Pędrak	11	P2	laboratoria	aktywne
82adc446-9829-43e6-a66c-db71ee186301	IwIKs6	2026-06-11	11:00:00	90	Komputerowe systemy sterowania	dr inż. G. Pędrak	11	P4	laboratoria	aktywne
7e51e22a-2b66-4b75-8d85-f05559d6a8ae	IwIKs6	2026-06-11	12:45:00	90	Podstawy Internetu Rzeczy	dr inż. P. Król	18	Lk1	laboratoria	aktywne
880e24d9-489c-4a89-96eb-6dd308c6cec4	IwIKs6	2026-06-11	12:45:00	90	Komputerowe systemy sterowania	dr inż. G. Pędrak	11	L4	laboratoria	aktywne
f4214528-3f8f-40d4-8320-ab59ee4a6ef9	IwIKs6	2026-06-11	14:30:00	90	Podstawy Internetu Rzeczy	dr inż. P. Król	18	Lk2	laboratoria	aktywne
69f2f52f-76a6-43ad-9ddc-5edd9238d9c2	IwIKs6	2026-06-11	14:30:00	90	Komputerowe systemy sterowania	dr inż. G. Pędrak	11	L5	laboratoria	aktywne
5f28b34b-6a84-4e86-bdd1-c5cc92d15dea	IwIKs6	2026-06-11	16:15:00	90	Podstawy Internetu Rzeczy	dr inż. P. Król	18	Lk3	laboratoria	aktywne
d4c27156-b994-4837-9391-742e13ab66aa	IwIKs6	2026-06-11	18:00:00	90	Podstawy Internetu Rzeczy	dr inż. P. Król	18	Lk4	laboratoria	aktywne
f6708c04-0523-4234-b22b-e8a90b05e72a	IwIKs6	2026-06-12	07:30:00	180	Komputerowe systemy sterowania	dr inż. K. Schiff	11	L1	laboratoria	aktywne
b844ed2a-8c1f-4574-8595-0f2bae7deb6c	IwIKs6	2026-06-12	10:45:00	180	Komputerowe systemy sterowania	dr inż. K. Schiff	11	L2	laboratoria	aktywne
89a47528-85e3-493d-8119-176e5fe47163	IwIKs6	2026-06-12	14:00:00	180	Komputerowe systemy sterowania	dr inż. K. Schiff	11	L3	laboratoria	aktywne
1af3581f-a392-4ce6-b47b-7578587debaf	IwIKs6	2026-06-15	11:00:00	90	Bezpieczeństwo systemów komputerowych	dr inż. A. Suchenia	101B	P1	laboratoria	aktywne
c150a464-64a1-4c71-a6bb-b18235c144ac	IwIKs6	2026-06-15	12:45:00	90	Bezpieczeństwo systemów komputerowych	dr inż. A. Suchenia	101B	P2	laboratoria	aktywne
d85a0884-df08-4c65-86be-ec2953702c91	IwIKs6	2026-06-15	16:15:00	90	Eksploracja danych	mgr inż. K. Czajkowski	201	Lk1 / P1	laboratoria	aktywne
cabe405b-95f4-474d-85f0-e78ff4ca034f	IwIKs6	2026-06-15	18:00:00	90	Eksploracja danych	mgr inż. K. Czajkowski	201	Lk2 / P2	laboratoria	aktywne
b5bd5a64-0914-4bc9-930d-d581b1b66094	IwIKs6	2026-06-15	18:00:00	90	Bezpieczeństwo systemów komputerowych	mgr inż. K. Kopera	101B	Lk3	laboratoria	aktywne
6fc13e69-8070-49eb-a92e-d6e25c6e82e9	IwIKs6	2026-06-15	19:45:00	90	Eksploracja danych	mgr inż. K. Czajkowski	201	Lk3 / P3	laboratoria	aktywne
b76379bf-08e5-47d0-a1d7-1ad0ca461fb5	IwIKs6	2026-06-15	19:45:00	90	Bezpieczeństwo systemów komputerowych	mgr inż. K. Kopera	101B	Lk2	laboratoria	aktywne
60a9033c-f80d-4f7f-b225-636a4a8b9574	IwIKs6	2026-06-16	14:30:00	45	Podstawy Internetu Rzeczy	dr inż. P. Król	A1	W	wykład	aktywne
4f9a93a4-8b3c-48c7-8a97-ce9a5f528562	IwIKs6	2026-06-16	16:15:00	90	Eksploracja danych	mgr inż. K. Czajkowski	202	Lk4 / P4	laboratoria	aktywne
1115353f-1e8b-4f4c-8edd-d567bd27611c	EiAs2	2026-04-22	10:00:00	90	Samodzielna działalność gospodarcza	dr J. Bąk	A2	W	Wykład	aktywne
46c1b7a3-8aa9-4e8a-8e22-129460fd5e5b	EiAs2	2026-04-29	10:00:00	90	Samodzielna działalność gospodarcza	dr J. Bąk	A2	W	Wykład	aktywne
8349e890-8bab-475f-a513-858d9095760c	EiAs2	2026-05-06	10:00:00	90	Samodzielna działalność gospodarcza	dr J. Bąk	A2	W	Wykład	aktywne
3cd9613f-0544-4504-aac9-f785ecde20d3	EiAs2	2026-05-13	10:00:00	90	Samodzielna działalność gospodarcza	dr J. Bąk	A2	W	Wykład	aktywne
e9541c39-726b-4140-9504-2660f98f2462	EiAs2	2026-05-20	10:00:00	90	Samodzielna działalność gospodarcza	dr J. Bąk	A2	W	Wykład	aktywne
9b8a3a1b-544b-481b-b9af-8264e383f6d7	EiAs2	2026-05-27	10:00:00	90	Samodzielna działalność gospodarcza	dr J. Bąk	A2	W	Wykład	aktywne
7a6a1989-8748-49f9-8e44-d1a9096eb953	EiAs2	2026-06-03	10:00:00	90	Samodzielna działalność gospodarcza	dr J. Bąk	A2	W	Wykład	aktywne
3319c58b-385c-4dfd-8d96-69ff2b961e66	EiAs2	2026-06-10	10:00:00	45	Samodzielna działalność gospodarcza	dr J. Bąk	A2	W	Wykład	aktywne
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."users" ("id", "firebase_uid", "role", "created_at") FROM stdin;
7c5da64a-e48d-4d48-b680-8dce8779cb1a	Me0ktUadWzRNHJDgis6KoW3hExE2	student	2026-04-27 18:24:08.263618+00
\.


--
-- Data for Name: tag_definitions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."tag_definitions" ("id", "user_id", "scope", "key", "label", "color_hex", "created_at") FROM stdin;
db76e089-ee99-40f5-8bcf-a005325ef2c9	\N	system	kolokwium	Kolokwium	#EF4444	2026-05-19 16:31:18.534092+00
70ef4756-a0dc-4b43-9975-af52557bd743	\N	system	wejsciowka	Wejściówka	#F59E0B	2026-05-19 16:31:18.534092+00
bf8a7ad3-9d4b-4df9-a9f6-73f2c740644b	\N	system	sprawozdanie	Sprawozdanie	#3B82F6	2026-05-19 16:31:18.534092+00
\.


--
-- Data for Name: user_added_events; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."user_added_events" ("id", "user_id", "event_id", "reason", "status", "created_at", "removed_at", "schedule_name") FROM stdin;
00c8f434-a0f4-4bef-a5ff-d91e750ae1fd	7c5da64a-e48d-4d48-b680-8dce8779cb1a	32af4741-81bd-4913-8111-55ead507973b	makeup	removed	2026-04-27 18:24:08.871445+00	2026-04-27 18:24:39.199+00	EiAs2
f3c4756a-1a0e-4aca-bc5f-860fb04f0c2e	7c5da64a-e48d-4d48-b680-8dce8779cb1a	32af4741-81bd-4913-8111-55ead507973b	makeup	removed	2026-04-27 18:25:35.420159+00	2026-04-27 18:27:40.918+00	EiAs2
754d8131-f963-4ef9-953a-b5d0382578e2	7c5da64a-e48d-4d48-b680-8dce8779cb1a	1c5bcd6b-e7b3-445c-8c40-91d33dfc78cb	makeup	removed	2026-04-27 18:50:38.370632+00	2026-04-28 17:51:17.797+00	EiAs2
fde2a08c-2f94-4426-adb4-0eb315c5f559	7c5da64a-e48d-4d48-b680-8dce8779cb1a	6a6ad72e-4efc-4cd3-b983-1b08f369342d	makeup	removed	2026-04-28 17:50:57.558391+00	2026-04-28 17:51:43.272+00	EiAs2
a6a0ceb4-e127-4963-8505-ac372868307b	7c5da64a-e48d-4d48-b680-8dce8779cb1a	4ff75868-34a9-4195-9161-01cc3a440d28	makeup	removed	2026-04-28 17:54:06.771894+00	2026-04-28 17:54:20.863+00	EiAs2
44844ea0-3721-413a-af83-2c3f595b6a34	7c5da64a-e48d-4d48-b680-8dce8779cb1a	6a6ad72e-4efc-4cd3-b983-1b08f369342d	makeup	removed	2026-04-28 17:56:26.139373+00	2026-04-28 17:56:43.707+00	EiAs2
2beddc18-d837-40f8-bc27-bee09eef05f8	7c5da64a-e48d-4d48-b680-8dce8779cb1a	4ff75868-34a9-4195-9161-01cc3a440d28	makeup	removed	2026-04-28 18:03:49.983018+00	2026-04-28 18:04:04.852+00	EiAs2
dce9e88a-318a-40c4-8f81-267974b93b75	7c5da64a-e48d-4d48-b680-8dce8779cb1a	02389465-3b62-4e8a-8988-d9471a937521	makeup	removed	2026-04-28 18:09:59.282826+00	2026-04-28 18:10:19.742+00	EiAs2
1c74f59e-f8bb-4fc0-8e4d-b833e3e0f249	7c5da64a-e48d-4d48-b680-8dce8779cb1a	82c7d247-3ebd-40b6-80ba-7a7828855e17	makeup	removed	2026-04-28 18:12:47.392099+00	2026-04-28 18:13:38.993+00	EiAs2
6130b6ea-0689-4752-82d7-67b731e5e33b	7c5da64a-e48d-4d48-b680-8dce8779cb1a	172d9062-4a14-4be1-9146-dc5f161aee8b	makeup	removed	2026-04-28 18:13:39.496573+00	2026-04-28 18:13:53.025+00	EiAs2
34a572a7-3f00-4dd7-b6f0-84fe86cea8ea	7c5da64a-e48d-4d48-b680-8dce8779cb1a	3bbb6569-eb76-4062-b0a9-4c2c26ac2206	makeup	removed	2026-04-28 18:17:25.342867+00	2026-04-28 18:17:48.471+00	EiAs2
a9bcf9bd-789c-4375-865d-1b09c7125b57	7c5da64a-e48d-4d48-b680-8dce8779cb1a	cd600085-1847-4b2f-9206-6d0138c71174	makeup	removed	2026-04-30 10:00:54.846009+00	2026-04-30 10:07:15.385+00	EiAs2
816e54e1-30fb-4614-86af-2ae3aba5ca96	7c5da64a-e48d-4d48-b680-8dce8779cb1a	6a6ad72e-4efc-4cd3-b983-1b08f369342d	makeup	removed	2026-04-28 18:22:07.615492+00	2026-04-30 10:07:15.553+00	EiAs2
41ee3daf-a34c-4670-aac7-7df22fd5201d	7c5da64a-e48d-4d48-b680-8dce8779cb1a	8cf9507a-f8ca-47f4-a9f8-00cd6f01dde0	makeup	removed	2026-04-29 16:23:37.72039+00	2026-04-30 10:07:16.682+00	EiAs2
74443c0d-c2fb-4173-b8ad-042da549c333	7c5da64a-e48d-4d48-b680-8dce8779cb1a	04470296-8cc7-4fed-b28f-63adec1c38ad	makeup	removed	2026-04-29 16:25:37.601847+00	2026-04-30 10:07:18.59+00	EiAs2
88b5237d-5746-4964-9c73-ce4e1b932149	7c5da64a-e48d-4d48-b680-8dce8779cb1a	be9de1eb-3509-4b58-8223-a9bfe33c8bc2	makeup	removed	2026-04-30 10:00:11.742766+00	2026-04-30 10:07:18.654+00	EiAs2
fdfd18a4-294c-47fd-930a-88a0043bcfef	7c5da64a-e48d-4d48-b680-8dce8779cb1a	04470296-8cc7-4fed-b28f-63adec1c38ad	makeup	active	2026-04-30 10:08:45.617525+00	\N	EiAs2
ee2f3fa4-deed-46b4-a2f1-1bbb1af62787	7c5da64a-e48d-4d48-b680-8dce8779cb1a	2024139b-73f5-4b9e-ac7b-7654a5c105ef	makeup	removed	2026-05-06 13:35:25.958399+00	2026-05-06 13:36:17.998+00	EiAs2
88653525-2941-4a96-9bfe-cac6bf7214c3	7c5da64a-e48d-4d48-b680-8dce8779cb1a	2024139b-73f5-4b9e-ac7b-7654a5c105ef	makeup	active	2026-05-07 09:24:32.831905+00	\N	EiAs2
4f458854-bf5b-420e-adb1-ae3568c6a14c	7c5da64a-e48d-4d48-b680-8dce8779cb1a	150eab33-c92f-429b-83e6-e8415aa62a3d	makeup	active	2026-05-08 16:16:38.702405+00	\N	EiAs2
\.


--
-- Data for Name: user_event_tags; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."user_event_tags" ("id", "user_id", "event_id", "schedule_name", "tag_id", "created_at") FROM stdin;
\.


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY "storage"."buckets" ("id", "name", "owner", "created_at", "updated_at", "public", "avif_autodetection", "file_size_limit", "allowed_mime_types", "owner_id", "type", "versioning_status") FROM stdin;
\.


--
-- Data for Name: buckets_analytics; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY "storage"."buckets_analytics" ("name", "type", "format", "created_at", "updated_at", "id", "deleted_at") FROM stdin;
\.


--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY "storage"."objects" ("id", "bucket_id", "name", "owner", "created_at", "updated_at", "last_accessed_at", "metadata", "version", "owner_id", "user_metadata", "archived_at", "is_delete_marker", "is_versioned") FROM stdin;
\.


--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY "storage"."s3_multipart_uploads" ("id", "in_progress_size", "upload_signature", "bucket_id", "key", "version", "owner_id", "created_at", "user_metadata", "metadata") FROM stdin;
\.


--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY "storage"."s3_multipart_uploads_parts" ("id", "upload_id", "size", "part_number", "bucket_id", "key", "etag", "owner_id", "version", "created_at") FROM stdin;
\.


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('"auth"."refresh_tokens_id_seq"', 1, false);


--
-- PostgreSQL database dump complete
--

-- \unrestrict Bn8umUfwkRUlWHEdtdjh88NLELWCAhFhSsaTYnuUftQe9zH2qRAcDSh3xjpbbGT

RESET ALL;
