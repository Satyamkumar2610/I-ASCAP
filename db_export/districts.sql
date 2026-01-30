--
-- PostgreSQL database dump
--

-- Dumped from database version 15.4 (Debian 15.4-1.pgdg110+1)
-- Dumped by pg_dump version 15.4 (Debian 15.4-1.pgdg110+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: districts; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public.districts (cdk, state_name, district_name, start_year, end_year) FROM stdin;
WB_24parg_1961	West Bengal	24 - Parganas	\N	\N
WB_south2_1971	West Bengal	Twenty Four Parganas	\N	\N
WB_barddh_1951	West Bengal	Barddhaman	\N	\N
WB_paschi_2011	West Bengal	Pashchim Barddhaman	\N	\N
WB_purbab_2024	West Bengal	Purba Barddhaman	\N	\N
WB_kolkat_1951	West Bengal	Calcutta	\N	\N
WB_kochbi_1971	West Bengal	Cooch Behar	\N	\N
WB_darjil_1971	West Bengal	Darjeeling	\N	\N
WB_kalimp_2024	West Bengal	Kalimpong	\N	\N
WB_hooghl_1971	West Bengal	Hooghly	\N	\N
WB_hugli_1981	West Bengal	Hugli	\N	\N
WB_haora_1971	West Bengal	Howrah	\N	\N
WB_jalpai_2011	West Bengal	Jalpaiguri	\N	\N
WB_alipur_2024	West Bengal	Alipurduar	\N	\N
WB_malda_1971	West Bengal	Malda	\N	\N
WB_maldah_1981	West Bengal	Maldah	\N	\N
WB_medini_1951	West Bengal	Medinipur	\N	\N
WB_purbam_2011	West Bengal	Purba Medinipur	\N	\N
WB_jhargr_2024	West Bengal	Jhargram	\N	\N
WB_puruli_1971	West Bengal	Purulia	\N	\N
WB_northt_1991	West Bengal	North Twenty Four Parganas	\N	\N
WB_southt_1991	West Bengal	South Twenty Four Parganas	\N	\N
WB_dakshi_1991	West Bengal	West Dinajpur	\N	\N
WB_uttard_2001	West Bengal	Uttar Dinajpur	\N	\N
UK_almora_1951	Uttarakhand	Almora	\N	\N
UK_pithor_1961	Uttarakhand	Pithoragarh	\N	\N
UK_bagesh_2001	Uttarakhand	Bageshwar	\N	\N
UK_chamol_1961	Uttarakhand	Chamoli	\N	\N
UK_rudrap_2001	Uttarakhand	Rudraprayag	\N	\N
UK_dehrad_1991	Uttarakhand	Dehra Dun	\N	\N
UK_garhwa_1951	Uttarakhand	Garhwal	\N	\N
UK_nainit_1971	Uttarakhand	Naini Tal	\N	\N
UK_udhams_2001	Uttarakhand	Udham Singh Nagar	\N	\N
UK_champa_2001	Uttarakhand	Champawat	\N	\N
UK_sahara_1981	Uttarakhand	Saharanpur	\N	\N
UK_hardwa_1991	Uttarakhand	Hardwar	\N	\N
UK_tehri_1951	Uttarakhand	Tehri Garhwal	\N	\N
UK_uttark_1961	Uttarakhand	Uttar Kashi	\N	\N
UP_agra_1981	Uttar Pradesh	Agra	\N	\N
UP_firoza_1991	Uttar Pradesh	Firozabad	\N	\N
UP_aligar_1991	Uttar Pradesh	Aligarh	\N	\N
UP_hathra_2001	Uttar Pradesh	Hathras	\N	\N
UP_allaha_1951	Uttar Pradesh	Allahabad	\N	\N
UP_kausha_2001	Uttar Pradesh	Kaushambi	\N	\N
UP_prayag_2024	Uttar Pradesh	Prayagraj	\N	\N
UP_azamga_1981	Uttar Pradesh	Azamgarh	\N	\N
UP_mau_1991	Uttar Pradesh	Mau	\N	\N
UP_bahrai_1991	Uttar Pradesh	Bahraich	\N	\N
UP_shrawa_2001	Uttar Pradesh	Shrawasti	\N	\N
UP_varana_1951	Uttar Pradesh	Banares	\N	\N
UP_banda_1991	Uttar Pradesh	Banda	\N	\N
UP_chitra_2001	Uttar Pradesh	Chitrakoot	\N	\N
UP_baraba_1991	Uttar Pradesh	Bara Banki	\N	\N
UP_basti_1981	Uttar Pradesh	Basti	\N	\N
UP_siddha_1991	Uttar Pradesh	Siddharthnagar	\N	\N
UP_santka_2001	Uttar Pradesh	Sant Kabir Nagar	\N	\N
UP_budaun_2011	Uttar Pradesh	Budaun	\N	\N
UP_sambha_2024	Uttar Pradesh	Sambhal (Bhimnagar)	\N	\N
UP_buland_1971	Uttar Pradesh	Bulandshahr	\N	\N
UP_ghazia_1981	Uttar Pradesh	Ghaziabad	\N	\N
UP_gautam_2001	Uttar Pradesh	Gautam Buddha Nagar	\N	\N
UP_deoria_1991	Uttar Pradesh	Deoria	\N	\N
UP_kushin_2001	Uttar Pradesh	Kushinagar	\N	\N
UP_etah_2001	Uttar Pradesh	Etah	\N	\N
UP_kanshi_2011	Uttar Pradesh	Kanshiram Nagar	\N	\N
UP_etawah_1991	Uttar Pradesh	Etawah	\N	\N
UP_auraiy_2001	Uttar Pradesh	Auraiya	\N	\N
UP_ayodhy_1991	Uttar Pradesh	Faizabad	\N	\N
UP_ambedk_2001	Uttar Pradesh	Ambedkar Nagar	\N	\N
UP_farruk_1991	Uttar Pradesh	Farrukhabad	\N	\N
UP_kannau_2001	Uttar Pradesh	Kannauj	\N	\N
UP_hapurp_2024	Uttar Pradesh	Hapur (Panchsheel Nagar)	\N	\N
UP_gonda_1991	Uttar Pradesh	Gonda	\N	\N
UP_balram_2001	Uttar Pradesh	Balrampur	\N	\N
UP_gorakh_1981	Uttar Pradesh	Gorakhpur	\N	\N
UP_mahara_1991	Uttar Pradesh	Maharajganj	\N	\N
UP_hamirp_1991	Uttar Pradesh	Hamirpur	\N	\N
UP_mahoba_2001	Uttar Pradesh	Mahoba	\N	\N
UP_jhansi_1971	Uttar Pradesh	Jhansi	\N	\N
UP_lalitp_1981	Uttar Pradesh	Lalitpur	\N	\N
UP_amroha_2001	Uttar Pradesh	Jyotiba Phule Nagar	\N	\N
UP_kanpur_1951	Uttar Pradesh	Kanpur	\N	\N
UP_kasgan_2024	Uttar Pradesh	Kasganj	\N	\N
UP_mahraj_2011	Uttar Pradesh	Mahrajganj	\N	\N
UP_mainpu_1981	Uttar Pradesh	Mainpuri	\N	\N
UP_meerut_1951	Uttar Pradesh	Meerut	\N	\N
UP_baghpa_2001	Uttar Pradesh	Baghpat	\N	\N
UP_mirzap_1981	Uttar Pradesh	Mirzapur	\N	\N
UP_sonbha_1991	Uttar Pradesh	Sonbhadra	\N	\N
UP_morada_1991	Uttar Pradesh	Moradabad	\N	\N
UP_muzaff_2011	Uttar Pradesh	Muzaffarnagar	\N	\N
UP_shamli_2024	Uttar Pradesh	Shamli (Prabuddhanagar)	\N	\N
UP_bhadoh_2001	Uttar Pradesh	Sant Ravidas Nagar	\N	\N
UP_sultan_2011	Uttar Pradesh	Sultanpur	\N	\N
UP_amethi_2024	Uttar Pradesh	Amethi	\N	\N
UP_chanda_2001	Uttar Pradesh	Chandauli	\N	\N
TR_northt_1971	Tripura	North Tripura	\N	\N
TR_dhalai_2001	Tripura	Dhalai	\N	\N
TR_unakot_2024	Tripura	Unakoti	\N	\N
TR_southt_1971	Tripura	South Tripura	\N	\N
TR_gomati_2024	Tripura	Gomati	\N	\N
TR_tripur_1951	Tripura	Tripura	\N	\N
TR_westtr_1971	Tripura	West Tripura	\N	\N
TR_khowai_2024	Tripura	Khowai	\N	\N
TR_sipahi_2024	Tripura	Sipahijala	\N	\N
TG_adilab_2011	Telangana	Adilabad	\N	\N
TG_kumura_2024	Telangana	Kumuram Bheem	\N	\N
TG_manche_2024	Telangana	Mancherial	\N	\N
TG_nirmal_2024	Telangana	Nirmal	\N	\N
TG_hydera_1971	Telangana	Hyderabad	\N	\N
TG_rangar_1981	Telangana	Rangareddi	\N	\N
TG_karimn_2011	Telangana	Karimnagar	\N	\N
TG_jagtia_2024	Telangana	Jagtial	\N	\N
TG_peddap_2024	Telangana	Peddapalli	\N	\N
TG_rajann_2024	Telangana	Rajanna Sircilla	\N	\N
TG_jayash_2024	Telangana	Jayashankar Bhupalpally	\N	\N
TG_siddip_2024	Telangana	Siddipet	\N	\N
TG_khamma_1961	Telangana	Khammam	\N	\N
TG_mulugu_2024	Telangana	Mulugu	\N	\N
TG_bhadra_2024	Telangana	Bhadradri Kothagudem	\N	\N
TG_mahabu_2024	Telangana	Mahabubabad	\N	\N
TG_mahbub_2011	Telangana	Mahbubnagar	\N	\N
TG_jogula_2024	Telangana	Jogulamba Gadwal	\N	\N
TG_nagark_2024	Telangana	Nagarkurnool	\N	\N
TG_wanapa_2024	Telangana	Wanaparthy	\N	\N
TG_naraya_2024	Telangana	Narayanpet	\N	\N
TG_medak_2011	Telangana	Medak	\N	\N
TG_sangar_2024	Telangana	Sangareddy	\N	\N
TG_nalgon_2011	Telangana	Nalgonda	\N	\N
TG_suryap_2024	Telangana	Suryapet	\N	\N
TG_yadadr_2024	Telangana	Yadadri Bhuvanagiri	\N	\N
TG_jangao_2024	Telangana	Jangaon	\N	\N
TG_nizama_2011	Telangana	Nizamabad	\N	\N
TG_kamare_2024	Telangana	Kamareddy	\N	\N
TG_medcha_2024	Telangana	Medchal–Malkajgiri	\N	\N
TG_vikara_2024	Telangana	Vikarabad	\N	\N
TG_warang_1951	Telangana	Warangal	\N	\N
TN_chenga_1951	Tamil Nadu	Chengalpattu	\N	\N
TN_thiruv_1951	Tamil Nadu	Thiruvallur	\N	\N
TN_chidam_1991	Tamil Nadu	Chidambaranar	\N	\N
TN_thooth_2001	Tamil Nadu	Toothukudi	\N	\N
TN_coimba_1951	Tamil Nadu	Coimbatore	\N	\N
TN_periya_1981	Tamil Nadu	Periyar	\N	\N
TN_tirupp_2011	Tamil Nadu	Tiruppur	\N	\N
TN_dharma_1971	Tamil Nadu	Dharmapuri	\N	\N
TN_krishn_2011	Tamil Nadu	Krishnagiri	\N	\N
TN_dindig_1991	Tamil Nadu	Dindigul Anna	\N	\N
TN_erode_2001	Tamil Nadu	Erode	\N	\N
TN_kamara_1991	Tamil Nadu	Kamarajar	\N	\N
TN_virudh_2001	Tamil Nadu	Virudhunagar	\N	\N
TN_kanniy_1961	Tamil Nadu	Kanyakumari	\N	\N
TN_chenna_1991	Tamil Nadu	Madras	\N	\N
TN_madura_1951	Tamil Nadu	Madurai	\N	\N
TN_theni_2001	Tamil Nadu	Theni	\N	\N
TN_nagapa_2001	Tamil Nadu	Nagapattinam	\N	\N
TN_mayila_2024	Tamil Nadu	Mayiladuthurai	\N	\N
TN_nilgir_1951	Tamil Nadu	Nilgiri	\N	\N
TN_narcot_1981	Tamil Nadu	North Arcot	\N	\N
TN_tiruva_1991	Tamil Nadu	Tiruvannamalai Sambuvarayar	\N	\N
TN_vellor_2001	Tamil Nadu	Vellore	\N	\N
TN_pasump_1991	Tamil Nadu	Pasumpon Muthuramalinga Thevar	\N	\N
TN_sivaga_2001	Tamil Nadu	Sivaganga	\N	\N
TN_peramb_2001	Tamil Nadu	Perambalur	\N	\N
TN_ariyal_2011	Tamil Nadu	Ariyalur	\N	\N
TN_ramana_1981	Tamil Nadu	Ramanathapuram	\N	\N
TN_salem_1961	Tamil Nadu	Salem	\N	\N
TN_namakk_2001	Tamil Nadu	Namakkal	\N	\N
TN_cuddal_1991	Tamil Nadu	South Arcot	\N	\N
TN_vilupp_2001	Tamil Nadu	Viluppuram	\N	\N
TN_thanja_1951	Tamil Nadu	Tanjore	\N	\N
TN_pudukk_1981	Tamil Nadu	Pudukkottai	\N	\N
TN_tiruch_1971	Tamil Nadu	Tiruchchirappalli	\N	\N
TN_karur_2001	Tamil Nadu	Karur	\N	\N
TN_tirune_1981	Tamil Nadu	Tirunelveli	\N	\N
TN_tenkas_2024	Tamil Nadu	Tenkasi	\N	\N
TN_tirupa_2024	Tamil Nadu	Tirupattur	\N	\N
TN_ranipe_2024	Tamil Nadu	Ranipet	\N	\N
TN_kallak_2024	Tamil Nadu	Kallakurichi	\N	\N
SK_east_2001	Sikkim	East	\N	\N
SK_gangto_2024	Sikkim	Gangtok	\N	\N
SK_pakyon_2024	Sikkim	Pakyong	\N	\N
SK_eastdi_1981	Sikkim	East District	\N	\N
SK_north_2001	Sikkim	North	\N	\N
SK_mangan_2024	Sikkim	Mangan	\N	\N
SK_northd_1981	Sikkim	North District	\N	\N
SK_sikkim_1971	Sikkim	Sikkim	\N	\N
SK_westdi_1981	Sikkim	West District	\N	\N
SK_southd_1981	Sikkim	South District	\N	\N
SK_south_2001	Sikkim	South	\N	\N
SK_namchi_2024	Sikkim	Namchi	\N	\N
SK_west_2001	Sikkim	West	\N	\N
SK_gyalsh_2024	Sikkim	Gyalshing	\N	\N
SK_soreng_2024	Sikkim	Soreng	\N	\N
RJ_bharat_1981	Rajasthan	Bharatpur	\N	\N
RJ_dhaulp_1991	Rajasthan	Dhaulpur	\N	\N
RJ_chitto_1951	Rajasthan	Chitorgarh	\N	\N
RJ_pratap_2011	Rajasthan	Pratapgarh	\N	\N
RJ_gangan_1991	Rajasthan	Ganganagar	\N	\N
RJ_hanuma_2001	Rajasthan	Hanumangarh	\N	\N
RJ_jaipur_1951	Rajasthan	Jaipur	\N	\N
RJ_dausa_2001	Rajasthan	Dausa	\N	\N
RJ_jalore_1951	Rajasthan	Jalore	\N	\N
RJ_jhunjh_1961	Rajasthan	Jhunjhunu	\N	\N
RJ_kota_1951	Rajasthan	Kota	\N	\N
RJ_baran_2001	Rajasthan	Baran	\N	\N
RJ_kotah_1951	Rajasthan	Kotah	\N	\N
RJ_sawaim_1951	Rajasthan	Sawai Madhopur	\N	\N
RJ_karaul_2001	Rajasthan	Karauli	\N	\N
RJ_udaipu_1951	Rajasthan	Udaipur	\N	\N
RJ_rajsam_2001	Rajasthan	Rajsamand	\N	\N
PB_amrits_2001	Punjab	Amritsar	\N	\N
PB_tarnta_2011	Punjab	Tarn Taran	\N	\N
PB_barnal_1951	Punjab	Barnala	\N	\N
PB_sangru_1951	Punjab	Sangrur	\N	\N
PB_bhatin_1951	Punjab	Bathinda	\N	\N
PB_mansa_2001	Punjab	Mansa	\N	\N
PB_faridk_1981	Punjab	Faridkot	\N	\N
PB_moga_2001	Punjab	Moga	\N	\N
PB_srimuk_2001	Punjab	Muktsar	\N	\N
PB_fatehg_1951	Punjab	Fatehgarh Sahib	\N	\N
PB_patial_1951	Punjab	Patiala	\N	\N
PB_firozp_1951	Punjab	Ferozepur	\N	\N
PB_fazilk_2024	Punjab	Fazilka	\N	\N
PB_gurdas_1951	Punjab	Gurdaspur	\N	\N
PB_pathan_2024	Punjab	Pathankot	\N	\N
PB_hoshia_1961	Punjab	Hoshiarpur	\N	\N
PB_ropar_1971	Punjab	Ropar	\N	\N
PB_shahid_2001	Punjab	Nawanshahr	\N	\N
PB_jaland_1971	Punjab	Jalandhar	\N	\N
PB_mohali_2011	Punjab	Sahibzada Ajit Singh Nagar	\N	\N
PB_rupnag_1981	Punjab	Rupnagar	\N	\N
PB_malerk_2024	Punjab	Malerkotla	\N	\N
PY_puduch_2001	Puducherry	Pondicherry	\N	\N
OD_balang_1981	Odisha	Balangir	\N	\N
OD_sonapu_2001	Odisha	Sonapur	\N	\N
OD_balaso_1971	Odisha	Balasore	\N	\N
OD_balesh_1981	Odisha	Baleshwar	\N	\N
OD_bhadra_2001	Odisha	Bhadrak	\N	\N
OD_baudh_1951	Odisha	Baudh Khondmals	\N	\N
OD_bolang_1971	Odisha	Bolangir	\N	\N
OD_cuttac_1991	Odisha	Cuttack	\N	\N
OD_kendra_2001	Odisha	Kendrapara	\N	\N
OD_jagats_2001	Odisha	Jagatsinghapur	\N	\N
OD_jajapu_2001	Odisha	Jajapur	\N	\N
OD_dhenka_1991	Odisha	Dhenkanal	\N	\N
OD_anugul_2001	Odisha	Anugul	\N	\N
OD_ganjam_1991	Odisha	Ganjam	\N	\N
OD_gajapa_2001	Odisha	Gajapati	\N	\N
OD_kalaha_1991	Odisha	Kalahandi	\N	\N
OD_nuapad_2001	Odisha	Nuapada	\N	\N
OD_keonjh_1971	Odisha	Keonjhar	\N	\N
OD_kenduj_1981	Odisha	Kendujhar	\N	\N
OD_korapu_1991	Odisha	Koraput	\N	\N
OD_rayaga_2001	Odisha	Rayagada	\N	\N
OD_nabara_2001	Odisha	Nabarangapur	\N	\N
OD_malkan_2001	Odisha	Malkangiri	\N	\N
OD_kandha_2001	Odisha	Kandhamal	\N	\N
OD_puri_1991	Odisha	Puri	\N	\N
OD_nayaga_2001	Odisha	Nayagarh	\N	\N
OD_khordh_2001	Odisha	Khordha	\N	\N
OD_sambal_1991	Odisha	Sambalpur	\N	\N
OD_bargar_2001	Odisha	Bargarh	\N	\N
OD_jharsu_2001	Odisha	Jharsuguda	\N	\N
OD_debaga_2001	Odisha	Debagarh	\N	\N
OD_subarn_2011	Odisha	Subarnapur	\N	\N
NC_delhi_1991	NCT of Delhi	Delhi	\N	\N
NC_northw_2001	NCT of Delhi	North West	\N	\N
NC_north_2001	NCT of Delhi	North	\N	\N
NC_northe_2001	NCT of Delhi	North East	\N	\N
NC_east_2001	NCT of Delhi	East	\N	\N
NC_newdel_2001	NCT of Delhi	New Delhi	\N	\N
NC_centra_2001	NCT of Delhi	Central	\N	\N
NC_west_2001	NCT of Delhi	West	\N	\N
NC_southw_2001	NCT of Delhi	South West	\N	\N
NC_south_2001	NCT of Delhi	South	\N	\N
NL_dimapu_2001	Nagaland	Dimapur	\N	\N
NL_chumou_2024	Nagaland	Chumoukedima	\N	\N
NL_niulan_2024	Nagaland	Niuland	\N	\N
NL_kohima_1951	Nagaland	Kohima	\N	\N
NL_phek_1981	Nagaland	Phek	\N	\N
NL_peren_2011	Nagaland	Peren	\N	\N
NL_tsemin_2024	Nagaland	Tseminyü	\N	\N
NL_mokokc_1961	Nagaland	Mokokchung	\N	\N
NL_wokha_1981	Nagaland	Wokha	\N	\N
NL_zunheb_1981	Nagaland	Zunheboto	\N	\N
NL_tuensa_1951	Nagaland	Tuensang	\N	\N
NL_mon_1981	Nagaland	Mon	\N	\N
NL_longle_2011	Nagaland	Longleng	\N	\N
NL_kiphir_2011	Nagaland	Kiphire	\N	\N
NL_noklak_2024	Nagaland	Noklak	\N	\N
MZ_aizawl_1981	Mizoram	Aizawl	\N	\N
MZ_mamit_2001	Mizoram	Mamit	\N	\N
MZ_kolasi_2001	Mizoram	Kolasib	\N	\N
MZ_champh_2001	Mizoram	Champhai	\N	\N
MZ_serchh_2001	Mizoram	Serchhip	\N	\N
MZ_saitua_2024	Mizoram	Saitual	\N	\N
MZ_khawza_2024	Mizoram	Khawzawl	\N	\N
MZ_chhimt_1981	Mizoram	Chhimtuipui	\N	\N
MZ_lawngt_2001	Mizoram	Lawngtlai	\N	\N
MZ_saiha_2001	Mizoram	Saiha	\N	\N
MZ_lungle_1981	Mizoram	Lunglei	\N	\N
MZ_hnathi_2024	Mizoram	Hnathial	\N	\N
MZ_mizora_1951	Mizoram	Lushai Hills	\N	\N
ML_eastga_1981	Meghalaya	East Garo Hills	\N	\N
ML_northg_2024	Meghalaya	North Garo Hills	\N	\N
ML_eastkh_1981	Meghalaya	East Khasi Hills	\N	\N
ML_ribhoi_2001	Meghalaya	Ri Bhoi	\N	\N
ML_garohi_1971	Meghalaya	Garo Hills	\N	\N
ML_westga_1981	Meghalaya	West Garo Hills	\N	\N
ML_jainti_1981	Meghalaya	Jaintia Hills	\N	\N
ML_westja_2024	Meghalaya	West Jaintia Hills	\N	\N
ML_eastja_2024	Meghalaya	East Jaintia Hills	\N	\N
ML_ekhasi_1971	Meghalaya	United Khasi and Jaintia Hills	\N	\N
ML_westkh_1981	Meghalaya	West Khasi Hills	\N	\N
ML_southg_2001	Meghalaya	South Garo Hills	\N	\N
ML_southw_2024	Meghalaya	South West Khasi Hills	\N	\N
ML_easter_2024	Meghalaya	Eastern West Khasi Hills	\N	\N
MN_tengno_1951	Manipur	Chandel	\N	\N
MN_churac_1991	Manipur	Churachandpur	\N	\N
MN_pherza_2024	Manipur	Pherzawl	\N	\N
MN_imphal_1991	Manipur	Imphal	\N	\N
MN_jiriba_2024	Manipur	Jiribam	\N	\N
MN_manipu_1951	Manipur	Manipur	\N	\N
MN_bishnu_1991	Manipur	Bishnupur	\N	\N
MN_thouba_1991	Manipur	Thoubal	\N	\N
MN_ukhrul_1991	Manipur	Ukhrul	\N	\N
MN_senapa_1991	Manipur	Senapati	\N	\N
MN_tameng_1991	Manipur	Tamenglong	\N	\N
MN_kangpo_2024	Manipur	Kangpokpi	\N	\N
MN_noney_2024	Manipur	Noney	\N	\N
MN_kakchi_2024	Manipur	Kakching	\N	\N
MN_kamjon_2024	Manipur	Kamjong	\N	\N
MH_ahmedn_1951	Maharashtra	Ahmadnagar	\N	\N
MH_akola_1991	Maharashtra	Akola	\N	\N
MH_washim_2001	Maharashtra	Washim	\N	\N
MH_aurang_1981	Maharashtra	Aurangabad	\N	\N
MH_jalna_1991	Maharashtra	Jalna	\N	\N
MH_sambha_2024	Maharashtra	Sambhaji Nagar	\N	\N
MH_bhanda_1991	Maharashtra	Bhandara	\N	\N
MH_gondia_2001	Maharashtra	Gondiya	\N	\N
MH_bhir_1971	Maharashtra	Bhir	\N	\N
MH_bid_1981	Maharashtra	Bid	\N	\N
MH_buldan_1951	Maharashtra	Buldana	\N	\N
MH_chandr_1961	Maharashtra	Chanda	\N	\N
MH_gadchi_1991	Maharashtra	Gadchiroli	\N	\N
MH_dhule_1951	Maharashtra	Dhule	\N	\N
MH_nandur_2001	Maharashtra	Nandurbar	\N	\N
MH_jalgao_1951	Maharashtra	East Khandesh	\N	\N
MH_greate_1991	Maharashtra	Greater Bombay	\N	\N
MH_mumbai_1951	Maharashtra	Mumbai	\N	\N
MH_kolaba_1971	Maharashtra	Kolaba	\N	\N
MH_raigar_1981	Maharashtra	Raigarh	\N	\N
MH_nasik_1971	Maharashtra	Nasik	\N	\N
MH_nashik_1981	Maharashtra	Nashik	\N	\N
MH_dharas_1981	Maharashtra	Osmanabad	\N	\N
MH_latur_1991	Maharashtra	Latur	\N	\N
MH_parbha_1991	Maharashtra	Parbhani	\N	\N
MH_hingol_2001	Maharashtra	Hingoli	\N	\N
MH_pune_1951	Maharashtra	Poona	\N	\N
MH_ratnag_1981	Maharashtra	Ratnagiri	\N	\N
MH_sindhu_1991	Maharashtra	Sindhudurg	\N	\N
MH_satara_1951	Maharashtra	Satara North	\N	\N
MH_sangli_1961	Maharashtra	Sangli	\N	\N
MH_sholap_1971	Maharashtra	Sholapur	\N	\N
MH_solapu_1981	Maharashtra	Solapur	\N	\N
MH_thane_1971	Maharashtra	Thana	\N	\N
MH_palgha_2024	Maharashtra	Palghar	\N	\N
MH_yavatman_1971	Maharashtra	Yeotmal	\N	\N
MH_yavatma_1981	Maharashtra	Yavatmal	\N	\N
MP_bhilsa_1951	Madhya Pradesh	Bhilsa	\N	\N
MP_vidish_1961	Madhya Pradesh	Vidisha	\N	\N
MP_chhind_1951	Madhya Pradesh	Chhindwara	\N	\N
MP_seoni_1961	Madhya Pradesh	Seoni	\N	\N
MP_khandw_1961	Madhya Pradesh	East Nimar	\N	\N
MP_burhan_2011	Madhya Pradesh	Burhanpur	\N	\N
MP_gird_1951	Madhya Pradesh	Gird	\N	\N
MP_gwalio_1961	Madhya Pradesh	Gwalior	\N	\N
MP_goona_1951	Madhya Pradesh	Goona	\N	\N
MP_guna_1961	Madhya Pradesh	Guna	\N	\N
MP_ashokn_2011	Madhya Pradesh	Ashoknagar	\N	\N
MP_narmad_1951	Madhya Pradesh	Hoshangabad	\N	\N
MP_narsin_1961	Madhya Pradesh	Narsimhapur	\N	\N
MP_harda_2001	Madhya Pradesh	Harda	\N	\N
MP_jabalp_1991	Madhya Pradesh	Jabalpur	\N	\N
MP_katni_2001	Madhya Pradesh	Katni	\N	\N
MP_jhabua_2001	Madhya Pradesh	Jhabua	\N	\N
MP_aliraj_2011	Madhya Pradesh	Alirajpur	\N	\N
MP_khargo_1961	Madhya Pradesh	Khargone	\N	\N
MP_mandla_1991	Madhya Pradesh	Mandla	\N	\N
MP_dindor_2001	Madhya Pradesh	Dindori	\N	\N
MP_mandsa_1991	Madhya Pradesh	Mandsaur	\N	\N
MP_neemuc_2001	Madhya Pradesh	Neemuch	\N	\N
MP_morena_1991	Madhya Pradesh	Morena	\N	\N
MP_sheopu_2001	Madhya Pradesh	Sheopur	\N	\N
MP_nimar_1951	Madhya Pradesh	Nimar	\N	\N
MP_sagar_1951	Madhya Pradesh	Sagar	\N	\N
MP_damoh_1961	Madhya Pradesh	Damoh	\N	\N
MP_sehore_1971	Madhya Pradesh	Sehore	\N	\N
MP_bhopal_1981	Madhya Pradesh	Bhopal	\N	\N
MP_shahdo_1991	Madhya Pradesh	Shahdol	\N	\N
MP_umaria_2001	Madhya Pradesh	Umaria	\N	\N
MP_annupu_2011	Madhya Pradesh	Annupur	\N	\N
MP_shajap_2011	Madhya Pradesh	Shajapur	\N	\N
MP_agarma_2024	Madhya Pradesh	Agar-Malwa	\N	\N
MP_sidhi_2001	Madhya Pradesh	Sidhi	\N	\N
MP_singra_2011	Madhya Pradesh	Singrauli	\N	\N
MP_tikamg_2011	Madhya Pradesh	Tikamgarh	\N	\N
MP_niwari_2024	Madhya Pradesh	Niwari	\N	\N
MP_barwan_2001	Madhya Pradesh	Barwani	\N	\N
LD_laksha_1971	Lakshadweep	Laccadive, Minicoy and Amindivi Islands	\N	\N
KL_alappu_1961	Kerala	Alleppey	\N	\N
KL_pathan_1991	Kerala	Pathanamthitta	\N	\N
KL_kannur_1961	Kerala	Cannanore	\N	\N
KL_wayana_1981	Kerala	Wayanad	\N	\N
KL_kasarg_1991	Kerala	Kasargod	\N	\N
KL_ernaku_1961	Kerala	Ernakulam	\N	\N
KL_idukki_1981	Kerala	Idukki	\N	\N
KL_kottay_1951	Kerala	Kottayam	\N	\N
KL_kozhik_1961	Kerala	Kozhikode	\N	\N
KL_malapp_1951	Kerala	Malappuram	\N	\N
KL_palgha_1961	Kerala	Palghat	\N	\N
KL_palakk_1991	Kerala	Palakkad	\N	\N
KL_kollam_1951	Kerala	Quilon	\N	\N
KL_thriss_1951	Kerala	Trichur	\N	\N
KL_thiruv_1951	Kerala	Trivandrum	\N	\N
KA_bangal_1981	Karnataka	Bangalore	\N	\N
KA_ramana_2011	Karnataka	Ramanagara	\N	\N
KA_belgau_2011	Karnataka	Belgaum	\N	\N
KA_bellar_2011	Karnataka	Bellary	\N	\N
KA_vijaya_2024	Karnataka	Vijayanagara	\N	\N
KA_bijapu_1991	Karnataka	Bijapur	\N	\N
KA_bagalk_2001	Karnataka	Bagalkot	\N	\N
KA_chikma_2011	Karnataka	Chikmagalur	\N	\N
KA_chikka_2011	Karnataka	Chikkamagaluru	\N	\N
KA_chitra_1951	Karnataka	Chitaldrug	\N	\N
KA_davana_2001	Karnataka	Davanagere	\N	\N
KA_kodagu_1971	Karnataka	Coorg	\N	\N
KA_dakshi_1971	Karnataka	Dakshin Kannad	\N	\N
KA_udupi_2001	Karnataka	Udupi	\N	\N
KA_dharwa_1971	Karnataka	Dharwad	\N	\N
KA_gadag_2001	Karnataka	Gadag	\N	\N
KA_haveri_2001	Karnataka	Haveri	\N	\N
KA_gulbar_2001	Karnataka	Gulbarga	\N	\N
KA_yadgir_2011	Karnataka	Yadgir	\N	\N
KA_kalabu_2024	Karnataka	Kalaburagi	\N	\N
KA_uttark_1951	Karnataka	Kanara	\N	\N
KA_kolar_2001	Karnataka	Kolar	\N	\N
KA_mysuru_1991	Karnataka	Mysore	\N	\N
KA_chamar_2001	Karnataka	Chamarajanagar	\N	\N
KA_raichu_1991	Karnataka	Raichur	\N	\N
KA_koppal_2001	Karnataka	Koppal	\N	\N
KA_bengal_2024	Karnataka	Bengaluru South	\N	\N
KA_shivam_2011	Karnataka	Shimoga	\N	\N
KA_tumaku_2011	Karnataka	Tumkur	\N	\N
JH_dhanba_1991	Jharkhand	Dhanbad	\N	\N
JH_bokaro_2001	Jharkhand	Bokaro	\N	\N
JH_dumka_1991	Jharkhand	Dumka	\N	\N
JH_jamtar_2011	Jharkhand	Jamtara	\N	\N
JH_giridi_1981	Jharkhand	Giridih	\N	\N
JH_gumla_1991	Jharkhand	Gumla	\N	\N
JH_simdeg_2011	Jharkhand	Simdega	\N	\N
JH_hazari_1971	Jharkhand	Hazaribag	\N	\N
JH_chatra_2001	Jharkhand	Chatra	\N	\N
JH_kodarm_2001	Jharkhand	Kodarma	\N	\N
JH_ramgar_2011	Jharkhand	Ramgarh	\N	\N
JH_pakaur_2001	Jharkhand	Pakaur	\N	\N
JH_pakur_2011	Jharkhand	Pakur	\N	\N
JH_palamu_1971	Jharkhand	Palamau	\N	\N
JH_garhwa_2001	Jharkhand	Garhwa	\N	\N
JH_lateha_2011	Jharkhand	Latehar	\N	\N
JH_psingh_1981	Jharkhand	Pashchimi Singhbhum	\N	\N
JH_saraik_2011	Jharkhand	Saraikela-kharsawan	\N	\N
JH_ranchi_1981	Jharkhand	Ranchi	\N	\N
JH_lohard_1991	Jharkhand	Lohardaga	\N	\N
JH_khunti_2011	Jharkhand	Khunti	\N	\N
JH_sahibg_1991	Jharkhand	Sahibganj	\N	\N
JH_santha_1971	Jharkhand	Santal Parganas	\N	\N
JH_deogha_1991	Jharkhand	Deoghar	\N	\N
JH_godda_1991	Jharkhand	Godda	\N	\N
JH_purbis_1991	Jharkhand	Purbi Singhbhum	\N	\N
JK_anantn_1961	Jammu & Kashmir	Anantnag	\N	\N
JK_kulgam_2011	Jammu & Kashmir	Kulgam	\N	\N
JK_baramu_1961	Jammu & Kashmir	Baramula	\N	\N
JK_kupwar_1981	Jammu & Kashmir	Kupwara	\N	\N
JK_bandip_2011	Jammu & Kashmir	Bandipore	\N	\N
JK_gander_2011	Jammu & Kashmir	Ganderbal	\N	\N
JK_doda_1961	Jammu & Kashmir	Doda	\N	\N
JK_ramban_2011	Jammu & Kashmir	Ramban	\N	\N
JK_kishtw_2011	Jammu & Kashmir	Kishtwar	\N	\N
JK_jammu_1961	Jammu & Kashmir	Jammu	\N	\N
JK_samba_2011	Jammu & Kashmir	Samba	\N	\N
JK_jammua_1951	Jammu & Kashmir	Jammu and Kashmir	\N	\N
JK_srinag_1961	Jammu & Kashmir	Srinagar	\N	\N
JK_ladakh_1961	Jammu & Kashmir	Ladakh	\N	\N
JK_poonch_1961	Jammu & Kashmir	Poonch	\N	\N
JK_kathua_1961	Jammu & Kashmir	Kathua	\N	\N
JK_udhamp_1961	Jammu & Kashmir	Udhampur	\N	\N
JK_kargil_1981	Jammu & Kashmir	Kargil	\N	\N
JK_lehlad_2001	Jammu & Kashmir	Leh (Ladakh)	\N	\N
JK_punch_1971	Jammu & Kashmir	Punch	\N	\N
JK_rajaur_1971	Jammu & Kashmir	Rajauri	\N	\N
JK_pulwam_1981	Jammu & Kashmir	Pulwama	\N	\N
JK_shupiy_2011	Jammu & Kashmir	Shupiyan	\N	\N
JK_rajour_2011	Jammu & Kashmir	Rajouri	\N	\N
JK_badgam_1981	Jammu & Kashmir	Badgam	\N	\N
JK_reasi_2011	Jammu & Kashmir	Reasi	\N	\N
HP_kangra_1951	Himachal Pradesh	Kangra	\N	\N
HP_lahaul_1961	Himachal Pradesh	Lahaul and Spiti	\N	\N
HP_kulu_1971	Himachal Pradesh	Kulu	\N	\N
HP_hamirp_1981	Himachal Pradesh	Hamirpur	\N	\N
HP_una_1981	Himachal Pradesh	Una	\N	\N
HP_kohist_1951	Himachal Pradesh	Kohistan	\N	\N
HP_shimla_1961	Himachal Pradesh	Simla	\N	\N
HP_kullu_1981	Himachal Pradesh	Kullu	\N	\N
HP_lahula_1971	Himachal Pradesh	Lahul and Spiti	\N	\N
HP_lahuls_2011	Himachal Pradesh	Lahul & Spiti	\N	\N
HP_mahasu_1951	Himachal Pradesh	Mahasu	\N	\N
HP_kinnau_1961	Himachal Pradesh	Kinnaur	\N	\N
HP_solan_1981	Himachal Pradesh	Solan	\N	\N
HP_sirmur_1951	Himachal Pradesh	Sirmoor	\N	\N
HR_ambala_1951	Haryana	Ambala	\N	\N
HR_yamuna_1991	Haryana	Yamunanagar	\N	\N
HR_panchk_2001	Haryana	Panchkula	\N	\N
HR_bhiwan_1981	Haryana	Bhiwani	\N	\N
HR_charkh_2024	Haryana	Charkhi Dadri	\N	\N
HR_farida_1981	Haryana	Faridabad	\N	\N
HR_palwal_2011	Haryana	Palwal	\N	\N
HR_guruga_1951	Haryana	Gurgaon	\N	\N
HR_mahend_1951	Haryana	Mahendragarh	\N	\N
HR_nuh_2011	Haryana	Mewat	\N	\N
HR_hisar_1951	Haryana	Hisar	\N	\N
HR_sirsa_1981	Haryana	Sirsa	\N	\N
HR_fateha_2001	Haryana	Fatehabad	\N	\N
HR_karnal_1951	Haryana	Karnal	\N	\N
HR_kuruks_1981	Haryana	Kurukshetra	\N	\N
HR_panipa_1991	Haryana	Panipat	\N	\N
HR_kaitha_1991	Haryana	Kaithal	\N	\N
HR_rewari_1991	Haryana	Rewari	\N	\N
HR_rohtak_1951	Haryana	Rohtak	\N	\N
HR_sonipa_1981	Haryana	Sonipat	\N	\N
HR_jhajja_2001	Haryana	Jhajjar	\N	\N
HR_sangru_1961	Haryana	Sangrur	\N	\N
HR_jind_1971	Haryana	Jind	\N	\N
GJ_ahmeda_1961	Gujarat	Ahmadabad	\N	\N
GJ_botad_2024	Gujarat	Botad	\N	\N
GJ_gandhi_1971	Gujarat	Gandhinagar	\N	\N
GJ_banask_1961	Gujarat	Banaskantha	\N	\N
GJ_baroda_1961	Gujarat	Baroda	\N	\N
GJ_vadoda_1971	Gujarat	Vadodara	\N	\N
GJ_bharuc_1961	Gujarat	Bharuch	\N	\N
GJ_narmad_2001	Gujarat	Narmada	\N	\N
GJ_bhavna_1951	Gujarat	Bhavnagar	\N	\N
GJ_centra_1951	Gujarat	Central Saurashtra	\N	\N
GJ_rajkot_1961	Gujarat	Rajkot	\N	\N
GJ_dangs_1961	Gujarat	Dangs	\N	\N
GJ_thedan_1971	Gujarat	The Dangs	\N	\N
GJ_jamnag_1951	Gujarat	Halar	\N	\N
GJ_devbhu_2024	Gujarat	Devbhumi Dwarka	\N	\N
GJ_morbi_2024	Gujarat	Morbi	\N	\N
GJ_junaga_1951	Gujarat	Junagadh	\N	\N
GJ_porban_2001	Gujarat	Porbandar	\N	\N
GJ_girsom_2024	Gujarat	Gir Somnath	\N	\N
GJ_kheda_1961	Gujarat	Kaira	\N	\N
GJ_anand_2001	Gujarat	Anand	\N	\N
GJ_mahisa_2024	Gujarat	Mahisagar	\N	\N
GJ_kutch_1971	Gujarat	Kutch	\N	\N
GJ_kachch_1981	Gujarat	Kachchh	\N	\N
GJ_mahesa_1961	Gujarat	Mahesana	\N	\N
GJ_patan_2001	Gujarat	Patan	\N	\N
GJ_panchm_1951	Gujarat	Panch Mahals	\N	\N
GJ_dohad_2001	Gujarat	Dohad	\N	\N
GJ_sabark_1961	Gujarat	Sabar Kantha	\N	\N
GJ_araval_2024	Gujarat	Aravalli	\N	\N
GJ_surat_1961	Gujarat	Surat	\N	\N
GJ_valsad_1971	Gujarat	Valsad	\N	\N
GJ_tapi_2011	Gujarat	Tapi	\N	\N
GJ_surend_1961	Gujarat	Surendranagar	\N	\N
GJ_chhota_2024	Gujarat	Chhota Udepur	\N	\N
GJ_navsar_2001	Gujarat	Navsari	\N	\N
GJ_zalawa_1951	Gujarat	Zalawad	\N	\N
GA_goa_1981	Goa	Goa	\N	\N
GA_northg_1991	Goa	North Goa	\N	\N
GA_southg_1991	Goa	South Goa	\N	\N
DL_delhi_1991	Delhi	Delhi	\N	\N
DL_northw_2001	Delhi	North West	\N	\N
DL_south_2001	Delhi	South	\N	\N
DL_northe_2001	Delhi	North East	\N	\N
DL_east_2001	Delhi	East	\N	\N
DL_southw_2001	Delhi	South West	\N	\N
DL_shahda_2024	Delhi	Shahdara	\N	\N
DL_north_2024	Delhi	North	\N	\N
DL_southe_2024	Delhi	South East	\N	\N
DL_newdel_2024	Delhi	New Delhi	\N	\N
DA_dadra_2001	Dadara & Nagar Havelli	Dadra and Nagar Haveli	\N	\N
CG_bastar_1991	Chhattisgarh	Bastar	\N	\N
CG_kanker_2001	Chhattisgarh	Kanker	\N	\N
CG_dantew_2001	Chhattisgarh	Dantewada	\N	\N
CG_naraya_2011	Chhattisgarh	Narayanpur	\N	\N
CG_kondag_2024	Chhattisgarh	Kondagaon	\N	\N
CG_bilasp_1991	Chhattisgarh	Bilaspur	\N	\N
CG_korba_2001	Chhattisgarh	Korba	\N	\N
CG_janjgi_2001	Chhattisgarh	Janjgir-Champa	\N	\N
CG_mungel_2024	Chhattisgarh	Mungeli	\N	\N
CG_gaurel_2024	Chhattisgarh	Gaurela-Pendra-Marwahi	\N	\N
CG_dakshi_2011	Chhattisgarh	Dakshin Bastar Dantewada	\N	\N
CG_sukma_2024	Chhattisgarh	Sukma	\N	\N
CG_bijapu_2011	Chhattisgarh	Bijapur	\N	\N
CG_durg_1971	Chhattisgarh	Durg	\N	\N
CG_rajnan_1981	Chhattisgarh	Raj Nandgaon	\N	\N
CG_balod_2024	Chhattisgarh	Balod	\N	\N
CG_bemeta_2024	Chhattisgarh	Bemetara	\N	\N
CG_uttarb_2011	Chhattisgarh	Uttar Bastar Kanker	\N	\N
CG_kaward_2001	Chhattisgarh	Kawardha	\N	\N
CG_kabeer_2011	Chhattisgarh	Kabeerdham	\N	\N
CG_raigar_1991	Chhattisgarh	Raigarh	\N	\N
CG_jashpu_2001	Chhattisgarh	Jashpur	\N	\N
CG_raipur_1991	Chhattisgarh	Raipur	\N	\N
CG_mahasa_2001	Chhattisgarh	Mahasamund	\N	\N
CG_dhamta_2001	Chhattisgarh	Dhamtari	\N	\N
CG_baloda_2024	Chhattisgarh	Baloda Bazar	\N	\N
CG_gariya_2024	Chhattisgarh	Gariyaband	\N	\N
CG_surguj_1991	Chhattisgarh	Surguja	\N	\N
CG_koriya_2001	Chhattisgarh	Koriya	\N	\N
CG_balram_2024	Chhattisgarh	Balrampur	\N	\N
CG_surajp_2024	Chhattisgarh	Surajpur	\N	\N
CH_ambala_1961	Chandigarh	Ambala	\N	\N
CH_chandi_1971	Chandigarh	Chandigarh	\N	\N
BR_bhagal_1991	Bihar	Bhagalpur	\N	\N
BR_banka_2001	Bihar	Banka	\N	\N
BR_bhojpu_1981	Bihar	Bhojpur	\N	\N
BR_buxar_2001	Bihar	Buxar	\N	\N
BR_champa_1971	Bihar	Champaran	\N	\N
BR_pashch_1981	Bihar	Pashchim Champaran	\N	\N
BR_purbac_1981	Bihar	Purba Champaran	\N	\N
BR_darbha_1971	Bihar	Darbhanga	\N	\N
BR_madhub_1981	Bihar	Madhubani	\N	\N
BR_samast_1981	Bihar	Samastipur	\N	\N
BR_gaya_1971	Bihar	Gaya	\N	\N
BR_aurang_1981	Bihar	Aurangabad	\N	\N
BR_nawada_1981	Bihar	Nawada	\N	\N
BR_jehana_1991	Bihar	Jehanabad	\N	\N
BR_arwal_2011	Bihar	Arwal	\N	\N
BR_monghy_1971	Bihar	Monghyr	\N	\N
BR_begusa_1981	Bihar	Begusarai	\N	\N
BR_munger_1981	Bihar	Munger	\N	\N
BR_khagar_1991	Bihar	Khagaria	\N	\N
BR_lakhis_2001	Bihar	Lakhisarai	\N	\N
BR_sheikh_2001	Bihar	Sheikhpura	\N	\N
BR_jamui_2001	Bihar	Jamui	\N	\N
BR_muzaff_1971	Bihar	Muzaffarpur	\N	\N
BR_sitama_1981	Bihar	Sitamarhi	\N	\N
BR_vaisha_1981	Bihar	Vaishali	\N	\N
BR_patna_1971	Bihar	Patna	\N	\N
BR_naland_1981	Bihar	Nalanda	\N	\N
BR_purnea_1971	Bihar	Purnea	\N	\N
BR_purnia_1981	Bihar	Purnia	\N	\N
BR_katiha_1981	Bihar	Katihar	\N	\N
BR_araria_1991	Bihar	Araria	\N	\N
BR_kishan_1991	Bihar	Kishanganj	\N	\N
BR_rohtas_1981	Bihar	Rohtas	\N	\N
BR_kaimur_2001	Bihar	Kaimur (Bhabua)	\N	\N
BR_sahars_1981	Bihar	Saharsa	\N	\N
BR_madhep_1991	Bihar	Madhepura	\N	\N
BR_supaul_2001	Bihar	Supaul	\N	\N
BR_saran_1971	Bihar	Saran	\N	\N
BR_gopalg_1981	Bihar	Gopalganj	\N	\N
BR_siwan_1981	Bihar	Siwan	\N	\N
BR_shahab_1971	Bihar	Shahabad	\N	\N
BR_sheoha_2001	Bihar	Sheohar	\N	\N
AS_baksa_2011	Assam	Baksa	\N	\N
AS_tamulp_2024	Assam	Tamulpur	\N	\N
AS_barpet_1991	Assam	Barpeta	\N	\N
AS_bajali_2024	Assam	Bajali	\N	\N
AS_bongai_1991	Assam	Bongaigaon	\N	\N
AS_chiran_2011	Assam	Chirang	\N	\N
AS_cachar_1981	Assam	Cachar	\N	\N
AS_karimg_1991	Assam	Karimganj	\N	\N
AS_hailak_1991	Assam	Hailakandi	\N	\N
AS_darran_1981	Assam	Darrang	\N	\N
AS_sonitp_1991	Assam	Sonitpur	\N	\N
AS_udalgu_2011	Assam	Udalguri	\N	\N
AS_dhubri_2011	Assam	Dhubri	\N	\N
AS_souths_2024	Assam	South Salmara-Mankachar	\N	\N
AS_dhubur_1991	Assam	Dhuburi	\N	\N
AS_dibrug_1981	Assam	Dibrugarh	\N	\N
AS_tinsuk_1991	Assam	Tinsukia	\N	\N
AS_goalpa_1981	Assam	Goalpara	\N	\N
AS_kokraj_1991	Assam	Kokrajhar	\N	\N
AS_jorhat_1991	Assam	Jorhat	\N	\N
AS_majuli_2024	Assam	Majuli	\N	\N
AS_kamrup_1981	Assam	Kamrup	\N	\N
AS_nalbar_1991	Assam	Nalbari	\N	\N
AS_karbia_1981	Assam	Karbi Anglong	\N	\N
AS_westka_2024	Assam	West Karbi Anglong	\N	\N
AS_lakhim_1971	Assam	Lakhimpur	\N	\N
AS_dhemaj_1991	Assam	Dhemaji	\N	\N
AS_mariga_1991	Assam	Marigaon	\N	\N
AS_moriga_2011	Assam	Morigaon	\N	\N
AS_mikirh_1971	Assam	Mikir Hills	\N	\N
AS_nagaon_1981	Assam	Nagaon	\N	\N
AS_hojai_2024	Assam	Hojai	\N	\N
AS_northc_1971	Assam	North Cachar Hills	\N	\N
AS_dimaha_2011	Assam	Dima Hasao	\N	\N
AS_nowgon_1971	Assam	Nowgong	\N	\N
AS_sivasa_1981	Assam	Sibsagar	\N	\N
AS_golagh_1991	Assam	Golaghat	\N	\N
AS_charai_2024	Assam	Charaideo	\N	\N
AS_biswan_2024	Assam	Biswanath	\N	\N
AS_united_1961	Assam	United Mikir and North Cachar Hills	\N	\N
AR_aborhi_1951	Arunachal Pradesh	Abor Hills	\N	\N
AR_siangf_1961	Arunachal Pradesh	Siang Frontier Division	\N	\N
AR_balipa_1951	Arunachal Pradesh	Balipara Frontier Tract	\N	\N
AR_kameng_1961	Arunachal Pradesh	Kameng Frontier	\N	\N
AR_subans_1961	Arunachal Pradesh	Subansiri Frontier	\N	\N
AR_dibang_1981	Arunachal Pradesh	Dibang Valley	\N	\N
AR_lowerd_2011	Arunachal Pradesh	Lower Dibang Valley	\N	\N
AR_eastka_1981	Arunachal Pradesh	East Kameng	\N	\N
AR_pakkek_2024	Arunachal Pradesh	Pakke-Kesang	\N	\N
AR_eastsi_1981	Arunachal Pradesh	East Siang	\N	\N
AR_uppers_1981	Arunachal Pradesh	Upper Siang	\N	\N
AR_siang_1971	Arunachal Pradesh	Siang	\N	\N
AR_lowers_1981	Arunachal Pradesh	Lower Siang	\N	\N
AR_lepara_2024	Arunachal Pradesh	Lepa - Rada	\N	\N
AR_westka_1981	Arunachal Pradesh	West Kameng	\N	\N
AR_kurung_2011	Arunachal Pradesh	Kurung Kumey	\N	\N
AR_kradaa_2024	Arunachal Pradesh	Kra Daadi	\N	\N
AR_lohit_1971	Arunachal Pradesh	Lohit	\N	\N
AR_anjaw_2011	Arunachal Pradesh	Anjaw	\N	\N
AR_namsai_2024	Arunachal Pradesh	Namsai	\N	\N
AR_lohitf_1961	Arunachal Pradesh	Lohit Frontier Division	\N	\N
AR_papump_2001	Arunachal Pradesh	Papum Pare	\N	\N
AR_kamle_2024	Arunachal Pradesh	Kamle	\N	\N
AR_mishmi_1951	Arunachal Pradesh	Mishmi Hills	\N	\N
AR_westsi_1981	Arunachal Pradesh	West Siang	\N	\N
AR_tirap_1971	Arunachal Pradesh	Tirap	\N	\N
AR_changl_1991	Arunachal Pradesh	Changlang	\N	\N
AR_longdi_2024	Arunachal Pradesh	Longding	\N	\N
AR_tirapf_1951	Arunachal Pradesh	Tirap Frontier Division	\N	\N
AR_tawang_1991	Arunachal Pradesh	Tawang	\N	\N
AR_shiyom_2024	Arunachal Pradesh	Shi-Yomi	\N	\N
AP_ananta_2011	Andhra Pradesh	Anantapur	\N	\N
AP_srisat_2024	Andhra Pradesh	Sri Sathya Sai	\N	\N
AP_chitto_2011	Andhra Pradesh	Chittoor	\N	\N
AP_annama_2024	Andhra Pradesh	Annamayya	\N	\N
AP_tirupa_2024	Andhra Pradesh	Tirupati	\N	\N
AP_kadapa_2001	Andhra Pradesh	Cuddapah	\N	\N
AP_ysr_2011	Andhra Pradesh	Y.S.R.	\N	\N
AP_eastgo_2011	Andhra Pradesh	East Godavari	\N	\N
AP_alluri_2024	Andhra Pradesh	Alluri Sitharama Raju	\N	\N
AP_drbram_2024	Andhra Pradesh	Dr. B. R. Ambedkar Konaseema	\N	\N
AP_kakina_2024	Andhra Pradesh	Kakinada	\N	\N
AP_guntur_1951	Andhra Pradesh	Guntur	\N	\N
AP_bapatl_2024	Andhra Pradesh	Bapatla	\N	\N
AP_palnad_2024	Andhra Pradesh	Palnadu	\N	\N
AP_krishn_2011	Andhra Pradesh	Krishna	\N	\N
AP_ntr_2024	Andhra Pradesh	NTR	\N	\N
AP_kurnoo_1951	Andhra Pradesh	Kurnool	\N	\N
AP_nandya_2024	Andhra Pradesh	Nandyal	\N	\N
AP_sripot_1971	Andhra Pradesh	Nellore	\N	\N
AP_prakas_1981	Andhra Pradesh	Prakasam	\N	\N
AP_srikak_1971	Andhra Pradesh	Srikakulam	\N	\N
AP_vizian_1981	Andhra Pradesh	Vizianagaram	\N	\N
AP_parvat_2024	Andhra Pradesh	Parvathipuram Manyam	\N	\N
AP_visakh_1961	Andhra Pradesh	Visakhapatnam	\N	\N
AP_vishak_1981	Andhra Pradesh	Vishakhapatnam	\N	\N
AP_anakap_2024	Andhra Pradesh	Anakapalli	\N	\N
AP_vizaga_1951	Andhra Pradesh	Vizagapatnam	\N	\N
AP_westgo_2011	Andhra Pradesh	West Godavari	\N	\N
AP_eluru_2024	Andhra Pradesh	Eluru	\N	\N
AN_andama_1971	Andaman and Nicobar Islands	Andaman	\N	\N
AN_nicoba_1981	Andaman and Nicobar Islands	Nicobar	\N	\N
AN_northm_2011	Andaman and Nicobar Islands	North & Middle Andaman	\N	\N
AN_southa_2011	Andaman and Nicobar Islands	South Andaman	\N	\N
AN_adilab_1951	Andhra Pradesh	Adilabad	1951	2024
RA_ajmer_1951	Rajasthan	Ajmer	1951	2024
KE_alappu_1951	Kerala	Alappuzha	1951	2024
RA_alwar_1951	Rajasthan	Alwar	1951	2024
MA_amrava_1951	Maharashtra	Amravati	1951	2024
GU_amreli_1951	Gujarat	Amreli	1951	2024
AR_anjaw_1951	Arunanchal Pradesh	Anjaw	1951	2024
MA_anuppu_1951	Madhya Pradesh	Anuppur	1951	2024
MA_balagh_1951	Madhya Pradesh	Balaghat	1951	2024
UT_ballia_1951	Uttar Pradesh	Ballia	1951	2024
WE_bankur_1951	West Bengal	Bankura	1951	2024
RA_banswa_1951	Rajasthan	Banswara	1951	2024
UT_bareil_1951	Uttar Pradesh	Bareilly	1951	2024
RA_barmer_1951	Rajasthan	Barmer	1951	2024
OD_bauda_1951	Odisha	Bauda	1951	2024
MA_betul_1951	Madhya Pradesh	Betul	1951	2024
RA_bhilwa_1951	Rajasthan	Bhilwara	1951	2024
MA_bhind_1951	Madhya Pradesh	Bhind	1951	2024
KA_bidar_1951	Karnataka	Bidar	1951	2024
UT_bijnor_1951	Uttar Pradesh	Bijnor	1951	2024
RA_bikane_1951	Rajasthan	Bikaner	1951	2024
HI_bilasp_1951	Himachal Pradesh	Bilaspur	1951	2024
WE_birbhu_1951	West Bengal	Birbhum	1951	2024
RA_bundi_1951	Rajasthan	Bundi	1951	2024
HI_chamba_1951	Himachal Pradesh	Chamba	1951	2024
KA_chamra_1951	Karnataka	Chamrajnagar	1951	2024
MA_chandr_1951	Maharashtra	Chandrapur	1951	2024
AR_changl_1951	Arunanchal Pradesh	Changlang	1951	2024
TA_chenna_1951	Tamil Nadu	Chennai	1951	2024
MA_chhata_1951	Madhya Pradesh	Chhatarpur	1951	2024
RA_chitta_1951	Rajasthan	Chittaurgarh	1951	2024
RA_churu_1951	Rajasthan	Churu	1951	2024
TA_cuddal_1951	Tamil Nadu	Cuddalore	1951	2024
DA_dadran_1951	Dadara & Nagar Havelli	Dadra & Nagar Haveli	1951	2024
WE_dakshi_1951	West Bengal	Dakshin Dinajpur	1951	2024
DA_daman_1951	Daman & Diu	Daman	1951	2024
WE_darjil_1951	West Bengal	Darjiling	1951	2024
JA_datano_1951	Jammu & Kashmir	Data Not Available	1951	2024
MA_datia_1951	Madhya Pradesh	Datia	1951	2024
MA_dewas_1951	Madhya Pradesh	Dewas	1951	2024
MA_dhar_1951	Madhya Pradesh	Dhar	1951	2024
AR_dibang_1951	Arunanchal Pradesh	Dibang Valley	1951	2024
DA_diu_1951	Daman & Diu	Diu	1951	2024
RA_dungar_1951	Rajasthan	Dungarpur	1951	2024
AR_eastka_1951	Arunanchal Pradesh	East Kameng	1951	2024
AR_eastsi_1951	Arunanchal Pradesh	East Siang	1951	2024
UT_fatehp_1951	Uttar Pradesh	Fatehpur	1951	2024
PU_firozp_1951	Punjab	Firozpur	1951	2024
MA_garhch_1951	Maharashtra	Garhchiroli	1951	2024
UT_ghazip_1951	Uttar Pradesh	Ghazipur	1951	2024
WE_haora_1951	West Bengal	Haora	1951	2024
UT_hardoi_1951	Uttar Pradesh	Hardoi	1951	2024
KA_hassan_1951	Karnataka	Hassan	1951	2024
UT_mahama_1951	Uttar Pradesh	Mahamaya Nagar	1951	2024
AN_hydera_1951	Andhra Pradesh	Hyderabad	1951	2024
MA_indore_1951	Madhya Pradesh	Indore	1951	2024
RA_jaisal_1951	Rajasthan	Jaisalmer	1951	2024
UT_jalaun_1951	Uttar Pradesh	Jalaun	1951	2024
MA_jalgao_1951	Maharashtra	Jalgaon	1951	2024
RA_jalor_1951	Rajasthan	Jalor	1951	2024
GU_jamnag_1951	Gujarat	Jamnagar	1951	2024
UT_jaunpu_1951	Uttar Pradesh	Jaunpur	1951	2024
RA_jhalaw_1951	Rajasthan	Jhalawar	1951	2024
RA_jodhpu_1951	Rajasthan	Jodhpur	1951	2024
TA_kanche_1951	Tamil Nadu	Kancheepuram	1951	2024
TA_kanniy_1951	Tamil Nadu	Kanniyakumari	1951	2024
KE_kannur_1951	Kerala	Kannur	1951	2024
UT_kansir_1951	Uttar Pradesh	Kansiram Nagar	1951	2024
PU_kapurt_1951	Punjab	Kapurthala	1951	2024
AN_karimn_1951	Andhra Pradesh	Karimnagar	1951	2024
KE_kasara_1951	Kerala	Kasaragod	1951	2024
AN_khamma_1951	Andhra Pradesh	Khammam	1951	2024
GU_kheda_1951	Gujarat	Kheda	1951	2024
UT_kheri_1951	Uttar Pradesh	Kheri	1951	2024
WE_kochbi_1951	West Bengal	Koch Bihar	1951	2024
KA_kodagu_1951	Karnataka	Kodagu	1951	2024
MA_kolhap_1951	Maharashtra	Kolhapur	1951	2024
WE_kolkat_1951	West Bengal	Kolkata	1951	2024
KE_kollam_1951	Kerala	Kollam	1951	2024
AR_kurung_1951	Arunanchal Pradesh	Kurung Kumey	1951	2024
MI_lawang_1951	Mizoram	Lawangtlai	1951	2024
AR_lohit_1951	Arunanchal Pradesh	Lohit	1951	2024
AR_lowerd_1951	Arunanchal Pradesh	Lower Dibang Valley	1951	2024
AR_lowers_1951	Arunanchal Pradesh	Lower Subansiri	1951	2024
UT_luckno_1951	Uttar Pradesh	Lucknow	1951	2024
PU_ludhia_1951	Punjab	Ludhiana	1951	2024
AN_mahbub_1951	Andhra Pradesh	Mahbubnagar	1951	2024
PU_mahe_1951	Puducherry	Mahe	1951	2024
HI_mandi_1951	Himachal Pradesh	Mandi	1951	2024
KA_mandya_1951	Karnataka	Mandya	1951	2024
UT_mathur_1951	Uttar Pradesh	Mathura	1951	2024
OD_mayurb_1951	Odisha	Mayurbhanj	1951	2024
AN_medak_1951	Andhra Pradesh	Medak	1951	2024
WE_murshi_1951	West Bengal	Murshidabad	1951	2024
WE_nadia_1951	West Bengal	Nadia	1951	2024
RA_nagaur_1951	Rajasthan	Nagaur	1951	2024
MA_nagpur_1951	Maharashtra	Nagpur	1951	2024
AN_nalgon_1951	Andhra Pradesh	Nalgonda	1951	2024
MA_nanded_1951	Maharashtra	Nanded	1951	2024
AN_sripot_1951	Andhra Pradesh	Sri Potti Sriramulu Nellore	1951	2024
AN_nizama_1951	Andhra Pradesh	Nizamabad	1951	2024
WE_north2_1951	West Bengal	North 24 Parganas	1951	2024
JH_palamu_1951	Jharkhand	Palamu	1951	2024
RA_pali_1951	Rajasthan	Pali	1951	2024
MA_panna_1951	Madhya Pradesh	Panna	1951	2024
AR_papump_1951	Arunanchal Pradesh	Papum Pare	1951	2024
UT_pilibh_1951	Uttar Pradesh	Pilibhit	1951	2024
UT_pratap_1951	Uttar Pradesh	Pratapgarh	1951	2024
MA_pune_1951	Maharashtra	Pune	1951	2024
UT_raebar_1951	Uttar Pradesh	Rae Bareli	1951	2024
MA_raisen_1951	Madhya Pradesh	Raisen	1951	2024
MA_rajgar_1951	Madhya Pradesh	Rajgarh	1951	2024
UT_rampur_1951	Uttar Pradesh	Rampur	1951	2024
AN_rangar_1951	Andhra Pradesh	Rangareddy	1951	2024
MA_ratlam_1951	Madhya Pradesh	Ratlam	1951	2024
MA_rewa_1951	Madhya Pradesh	Rewa	1951	2024
UT_sahara_1951	Uttar Pradesh	Saharanpur	1951	2024
BI_saranc_1951	Bihar	Saran (chhapra)	1951	2024
MA_satna_1951	Madhya Pradesh	Satna	1951	2024
PU_shahid_1951	Punjab	Shahid Bhagat Singh Nagar	1951	2024
UT_shahja_1951	Uttar Pradesh	Shahjahanpur	1951	2024
HI_shimla_1951	Himachal Pradesh	Shimla	1951	2024
MA_shivpu_1951	Madhya Pradesh	Shivpuri	1951	2024
AS_sivasa_1951	Assam	Sivasagar	1951	2024
RA_sikar_1951	Rajasthan	Sikar	1951	2024
HI_sirmau_1951	Himachal Pradesh	Sirmaur	1951	2024
RA_sirohi_1951	Rajasthan	Sirohi	1951	2024
UT_sitapu_1951	Uttar Pradesh	Sitapur	1951	2024
WE_south2_1951	West Bengal	South 24 Parganas	1951	2024
OD_sundar_1951	Odisha	Sundargarh	1951	2024
AR_tawang_1951	Arunanchal Pradesh	Tawang	1951	2024
MA_thane_1951	Maharashtra	Thane	1951	2024
TA_thanja_1951	Tamil Nadu	Thanjavur	1951	2024
TA_thenil_1951	Tamil Nadu	The Nilgiris	1951	2024
KE_thiruv_1951	Kerala	Thiruvananthapuram	1951	2024
TA_thooth_1951	Tamil Nadu	Thoothukkudi	1951	2024
KE_thriss_1951	Kerala	Thrissur	1951	2024
AR_tirap_1951	Arunanchal Pradesh	Tirap	1951	2024
RA_tonk_1951	Rajasthan	Tonk	1951	2024
MA_ujjain_1951	Madhya Pradesh	Ujjain	1951	2024
UT_unnao_1951	Uttar Pradesh	Unnao	1951	2024
AR_uppers_1951	Arunanchal Pradesh	Upper Siang	1951	2024
KA_uttara_1951	Karnataka	Uttara Kannada	1951	2024
UT_varana_1951	Uttar Pradesh	Varanasi	1951	2024
TA_virudu_1951	Tamil Nadu	Virudunagar	1951	2024
AN_warang_1951	Andhra Pradesh	Warangal	1951	2024
MA_wardha_1951	Maharashtra	Wardha	1951	2024
AR_westka_1951	Arunanchal Pradesh	West Kameng	1951	2024
MA_westni_1951	Madhya Pradesh	West Nimar	1951	2024
AR_westsi_1951	Arunanchal Pradesh	West Siang	1951	2024
TA_nagapp_1951	Tamil Nadu	Nagappattinam	1951	2024
PU_karaik_1951	Puducherry	Karaikal	1951	2024
PU_puduch_1951	Puducherry	Puducherry	1951	2024
PU_yanam_1951	Puducherry	Yanam	1951	2024
LA_laksha_1951	Lakshadweep	Lakshadweep	1951	2024
\.


--
-- PostgreSQL database dump complete
--

