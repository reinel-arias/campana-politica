USE campana_politica;

-- ============================================================
-- Zonas
-- ============================================================
INSERT INTO zonas (codigo) VALUES
('01'), ('02'), ('03'), ('04'), ('05'),
('06'), ('07'), ('08'), ('09'), ('10'),
('11'), ('90'), ('98'), ('99');

-- ============================================================
-- Puestos de Votación
-- ============================================================
INSERT INTO puestos_votacion (zona_id, codigo, nombre, direccion, num_mesas) VALUES
-- Zona 01
((SELECT id FROM zonas WHERE codigo = '01'), '01', 'INST.EDUC.VILLASANTANA',          'CL 14D ESTE # 14-40 MONSERRATE',               24),
((SELECT id FROM zonas WHERE codigo = '01'), '02', 'I.E. COMPARTIR LAS BRISAS',       'CL 23 ESTE # 35 - 25 LAS BRISAS',              8),
((SELECT id FROM zonas WHERE codigo = '01'), '03', 'I.E. JAIME SALAZAR ROBLEDO',      'KR 23 # 16 ESTE - 35 BR. TOKIO',               9),
-- Zona 02
((SELECT id FROM zonas WHERE codigo = '02'), '01', 'CTRO.EDU.JORGE ELIECER GAITAN',   'KR. 7 #. 1E - 31 ALFONSO LOPEZ',               21),
((SELECT id FROM zonas WHERE codigo = '02'), '02', 'INSTITUTO KENNEDY',               'KR 12 #. 9E - 12',                             28),
((SELECT id FROM zonas WHERE codigo = '02'), '03', 'ESC. GENERAL MOSQUERA Sede 2',    'AV DEL RIO Cra 1a. Con calles 3 y 4',          9),
((SELECT id FROM zonas WHERE codigo = '02'), '04', 'IE MARCO FIDEL SUAREZ',           'CALLE 8 No 11-34',                             15),
((SELECT id FROM zonas WHERE codigo = '02'), '05', 'COLEGIO BASICO CENTENARIO',       'KR 9A. #. 4 - 06',                             14),
-- Zona 03
((SELECT id FROM zonas WHERE codigo = '03'), '01', 'INST.EDU.CARLOTA SANCHEZ',        'CL 19 # 3 - 38',                               27),
((SELECT id FROM zonas WHERE codigo = '03'), '02', 'INST.EDUC.ALFREDO GARCIA',        'KR 2A # 34 B 40',                              38),
((SELECT id FROM zonas WHERE codigo = '03'), '03', 'COLEGIO SAN JOSE',                'KR 3A #. 27 - 76',                             17),
((SELECT id FROM zonas WHERE codigo = '03'), '04', 'INST.EDU.CARLOTA SANCHEZ 2',      'CL 20 # 3 - 23',                               19),
((SELECT id FROM zonas WHERE codigo = '03'), '05', 'INST.EDU.CARLOTA SANCHEZ 3',      'CL 20 #. 3 - 65',                              14),
-- Zona 04
((SELECT id FROM zonas WHERE codigo = '04'), '01', 'COLEGIO GIMNASIO PEREIRA',        'KR 13 #. 3E - 99 BR. LA AURORA',               17),
((SELECT id FROM zonas WHERE codigo = '04'), '02', 'COMPLEJO EDUC LA JULITA',         'CALLE 14 CARRERA 17-02 ESQ',                   11),
((SELECT id FROM zonas WHERE codigo = '04'), '03', 'UNIV.TECNOLOGICA DE PEREIRA',     'CL 11 # 27 - 59 ALAMOS',                       16),
-- Zona 05
((SELECT id FROM zonas WHERE codigo = '05'), '01', 'INST.EDUCATIVA BOYACA',           'KR 5A. #. 21 - 02',                            17),
((SELECT id FROM zonas WHERE codigo = '05'), '02', 'CENTRO CULTURAL LUCY TEJADA',     'KR.9 ENTRE CLS 16 Y 17',                       48),
-- Zona 06
((SELECT id FROM zonas WHERE codigo = '06'), '01', 'COL.OFICIAL LA INMACULADA',       'KR. 8 #. 39 - 40',                             32),
((SELECT id FROM zonas WHERE codigo = '06'), '02', 'SENA',                            'KR. 8 #. 26 - 75',                             37),
((SELECT id FROM zonas WHERE codigo = '06'), '03', 'GOBERNACION DE RISARALDA',        'KR 13 CLL 19 PARQUE OLAYA',                    38),
-- Zona 07
((SELECT id FROM zonas WHERE codigo = '07'), '01', 'COLEGIO SAN NICOLAS',             'KR. 15 #. 30 - 34 SAN NICOLÁS',               21),
((SELECT id FROM zonas WHERE codigo = '07'), '02', 'COLEGIO NORMAL SUPERIOR',         'KR 17 BIS # 46 - 50 URB. EL JARDIN II ETAPA', 16),
((SELECT id FROM zonas WHERE codigo = '07'), '03', 'COLEGIO SUR ORIENTAL',            'CL 17 # 23 B 26 BR. BOSTON',                   21),
((SELECT id FROM zonas WHERE codigo = '07'), '04', 'INST.EDUCATIVA PROVIDENCIA',      'KR. 20 #. 23 - 15',                            14),
((SELECT id FROM zonas WHERE codigo = '07'), '05', 'CENTRO EDUC.EL ROCÍO',            'INSPECCIÓN URBANA EL ROCÍO',                   6),
-- Zona 08
((SELECT id FROM zonas WHERE codigo = '08'), '01', 'INST.EDUCATIVA CIUDAD BOQUIA',    'KR 6A # 63 - 50 SEC. E CIUDADELA DEL CAFÉ',    42),
((SELECT id FROM zonas WHERE codigo = '08'), '02', 'LICEO CIAL AQUILINO BEDOYA',      'AV 30 DE AGOSTO #. 62 - 59',                   19),
-- Zona 09
((SELECT id FROM zonas WHERE codigo = '09'), '01', 'IE REMIGIO ANTONIO CAÑARTE',      'KR 22 B # 29 - 40 BR. EL POBLADO I ETAPA',    19),
((SELECT id FROM zonas WHERE codigo = '09'), '02', 'I.E.SAMARIA',                     'KR 34 # 32C - 35 SAMARIA I',                   21),
((SELECT id FROM zonas WHERE codigo = '09'), '03', 'CENTRO EDUC.NARANJITO',           'CL 66 D # 44 - 45 VEREDA NARANJITO',           28),
-- Zona 10
((SELECT id FROM zonas WHERE codigo = '10'), '01', 'COLEGIO OFICIAL CIUDADELA CUBA',  'CL. 71 CRA. 28 BARRIO LOS CRISTALES',          32),
((SELECT id FROM zonas WHERE codigo = '10'), '02', 'CTRO EDUC.BAYRON GAVIRIA',        'CL 75 # 36F - 26 LOS HÉROES',                  37),
((SELECT id FROM zonas WHERE codigo = '10'), '03', 'COLEGIO BASICO SAN JOAQUIN',      'CL 86 # 36 - 40 SAN JOAQUÍN',                  27),
((SELECT id FROM zonas WHERE codigo = '10'), '04', 'COL.SOFFY HERNANDEZ MARIN',       'KR 26 B # 74 A 35 CUBA',                       11),
((SELECT id FROM zonas WHERE codigo = '10'), '05', 'COL RODRIGO ARENAS BETANCUR',     'CL 80 No 36B-30',                              3),
-- Zona 11
((SELECT id FROM zonas WHERE codigo = '11'), '01', 'UNI.LIBRE DE PEREIRA BELMONTE',   'AV DE LAS AMÉRICAS SECTOR BELMONTE',           17),
((SELECT id FROM zonas WHERE codigo = '11'), '02', 'CTRO EDUC.LUIS CARLOS GONZALEZ',  'CL 82 KR 17 BIS GAMMA II',                     16),
((SELECT id FROM zonas WHERE codigo = '11'), '03', 'COL.BASICO ALFONSO JARAMILLO',    'KR. 25 #. 77 - 18 BR. CORALES',                27),
((SELECT id FROM zonas WHERE codigo = '11'), '04', 'INST.EDUC.ESCOLAR SAN FERNANDO',  'CL 70 #. 23B - 20 CUBA',                       38),
((SELECT id FROM zonas WHERE codigo = '11'), '05', 'CENTRO EDUCATIVO JUAN XXIII',     'KR. 23 BIS #.74 - 40 CUBA',                    24),
-- Zona 90
((SELECT id FROM zonas WHERE codigo = '90'), '01', 'COL.INEM FELIPE PEREZ JARDIN 1',  'BARRIO EL JARDIN ETAPA 1',                     31),
-- Zona 98
((SELECT id FROM zonas WHERE codigo = '98'), '01', 'CARCEL',                          'KR. 8A #. 41 - 97',                            1),
-- Zona 99 (corregimientos rurales)
((SELECT id FROM zonas WHERE codigo = '99'), '05', 'ALTAGRACIA',                      'CTRO EDUCATIVO MARÍA CRISTINA GOMEZ',          12),
((SELECT id FROM zonas WHERE codigo = '99'), '08', 'LA FLORIDA',                      'I.E HÉCTOR ANGEL ARCILA',                      6),
((SELECT id FROM zonas WHERE codigo = '99'), '09', 'SAN JOSE',                        'CENT DOC SAN JOSE OTUN VIA LA FLORIDA',        3),
((SELECT id FROM zonas WHERE codigo = '99'), '10', 'EL CHOCHO',                       'CTRO EDUCATIVO ANA ARANGO DE URIBE',           3),
((SELECT id FROM zonas WHERE codigo = '99'), '13', 'LA BELLA',                        'I.E. LA BELLA',                                5),
((SELECT id FROM zonas WHERE codigo = '99'), '21', 'MUNDO NUEVO',                     'INSTITUTO DOCENTE MUNDO NUEVO',                3),
((SELECT id FROM zonas WHERE codigo = '99'), '22', 'LA GRAMINEA',                     'CTRO EDUCATIVO LA GRAMÍNEA',                   2),
((SELECT id FROM zonas WHERE codigo = '99'), '23', 'EL MANZANO',                      'INST. DOCENTE EL MANZANO',                     2),
((SELECT id FROM zonas WHERE codigo = '99'), '30', 'TRIBUNAS CORCEGA',                'COL. OFICIAL JOSÉ ANTONIO GALÁN',              12),
((SELECT id FROM zonas WHERE codigo = '99'), '34', 'ARABIA',                          'INST AGRÍCOLA SAN FRANCISCO DE ASIS',          6),
((SELECT id FROM zonas WHERE codigo = '99'), '39', 'BETULIA',                         'CTRO DOCENTE BETULIA',                         3),
((SELECT id FROM zonas WHERE codigo = '99'), '40', 'YARUMAL',                         'INST. DOCENTE YARUMAL',                        2),
((SELECT id FROM zonas WHERE codigo = '99'), '41', 'PUERTO CALDAS PUENTE BOLIVAR',    'C.E. ENRIQUE MILLÁN RUBIO',                    9),
((SELECT id FROM zonas WHERE codigo = '99'), '48', 'CAIMALITO',                       'I.E. GABRIEL TRUJILLO',                        9),
((SELECT id FROM zonas WHERE codigo = '99'), '61', 'COMBIA BAJA',                     'ESC. EL PLACER',                               7),
((SELECT id FROM zonas WHERE codigo = '99'), '65', 'LA HONDA',                        'CTRO EDUCATIVO LA HONDA',                      1),
((SELECT id FROM zonas WHERE codigo = '99'), '70', 'LA CONVENCION',                   'ESC. SAN VICENTE',                             3),
((SELECT id FROM zonas WHERE codigo = '99'), '74', 'COMBIA ALTA',                     'INSTITUTO EDUCATIVO EL PITAL',                 5),
((SELECT id FROM zonas WHERE codigo = '99'), '85', 'CERRITOS',                        'COLEGIO COMUNITARIO CERRITOS',                 18),
((SELECT id FROM zonas WHERE codigo = '99'), '90', 'MORELIA',                         'CTRO DOCENTE MORELIA',                         7),
((SELECT id FROM zonas WHERE codigo = '99'), '96', 'LA ESTRELLA LA PALMILLA',         'ESC. RURAL LA ESTRELLA - LA PALMILLA',         4);
