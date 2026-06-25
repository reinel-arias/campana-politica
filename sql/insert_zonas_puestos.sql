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
((SELECT id FROM zonas WHERE codigo = '01'), '01', 'Inst.educ.villasantana',          'cl 14d este # 14-40 monserrate',               24),
((SELECT id FROM zonas WHERE codigo = '01'), '02', 'I.e. Compartir Las Brisas',       'cl 23 este # 35 - 25 las brisas',              8),
((SELECT id FROM zonas WHERE codigo = '01'), '03', 'I.e. Jaime Salazar Robledo',      'kr 23 # 16 este - 35 br. tokio',               9),
-- Zona 02
((SELECT id FROM zonas WHERE codigo = '02'), '01', 'Ctro.edu.jorge Eliecer Gaitan',   'kr. 7 #. 1e - 31 alfonso lopez',               21),
((SELECT id FROM zonas WHERE codigo = '02'), '02', 'Instituto Kennedy',               'kr 12 #. 9e - 12',                             28),
((SELECT id FROM zonas WHERE codigo = '02'), '03', 'Esc. General Mosquera Sede 2',    'av del rio cra 1a. con calles 3 y 4',          9),
((SELECT id FROM zonas WHERE codigo = '02'), '04', 'Ie Marco Fidel Suarez',           'calle 8 no 11-34',                             15),
((SELECT id FROM zonas WHERE codigo = '02'), '05', 'Colegio Basico Centenario',       'kr 9a. #. 4 - 06',                             14),
-- Zona 03
((SELECT id FROM zonas WHERE codigo = '03'), '01', 'Inst.edu.carlota Sanchez',        'cl 19 # 3 - 38',                               27),
((SELECT id FROM zonas WHERE codigo = '03'), '02', 'Inst.educ.alfredo Garcia',        'kr 2a # 34 b 40',                              38),
((SELECT id FROM zonas WHERE codigo = '03'), '03', 'Colegio San Jose',                'kr 3a #. 27 - 76',                             17),
((SELECT id FROM zonas WHERE codigo = '03'), '04', 'Inst.edu.carlota Sanchez 2',      'cl 20 # 3 - 23',                               19),
((SELECT id FROM zonas WHERE codigo = '03'), '05', 'Inst.edu.carlota Sanchez 3',      'cl 20 #. 3 - 65',                              14),
-- Zona 04
((SELECT id FROM zonas WHERE codigo = '04'), '01', 'Colegio Gimnasio Pereira',        'kr 13 #. 3e - 99 br. la aurora',               17),
((SELECT id FROM zonas WHERE codigo = '04'), '02', 'Complejo Educ La Julita',         'calle 14 carrera 17-02 esq',                   11),
((SELECT id FROM zonas WHERE codigo = '04'), '03', 'Univ.tecnologica De Pereira',     'cl 11 # 27 - 59 alamos',                       16),
-- Zona 05
((SELECT id FROM zonas WHERE codigo = '05'), '01', 'Inst.educativa Boyaca',           'kr 5a. #. 21 - 02',                            17),
((SELECT id FROM zonas WHERE codigo = '05'), '02', 'Centro Cultural Lucy Tejada',     'kr.9 entre cls 16 y 17',                       48),
-- Zona 06
((SELECT id FROM zonas WHERE codigo = '06'), '01', 'Col.oficial La Inmaculada',       'kr. 8 #. 39 - 40',                             32),
((SELECT id FROM zonas WHERE codigo = '06'), '02', 'Sena',                            'kr. 8 #. 26 - 75',                             37),
((SELECT id FROM zonas WHERE codigo = '06'), '03', 'Gobernacion De Risaralda',        'kr 13 cll 19 parque olaya',                    38),
-- Zona 07
((SELECT id FROM zonas WHERE codigo = '07'), '01', 'Colegio San Nicolas',             'kr. 15 #. 30 - 34 san nicolás',               21),
((SELECT id FROM zonas WHERE codigo = '07'), '02', 'Colegio Normal Superior',         'kr 17 bis # 46 - 50 urb. el jardin ii etapa', 16),
((SELECT id FROM zonas WHERE codigo = '07'), '03', 'Colegio Sur Oriental',            'cl 17 # 23 b 26 br. boston',                   21),
((SELECT id FROM zonas WHERE codigo = '07'), '04', 'Inst.educativa Providencia',      'kr. 20 #. 23 - 15',                            14),
((SELECT id FROM zonas WHERE codigo = '07'), '05', 'Centro Educ.el Rocío',            'inspección urbana el rocío',                   6),
-- Zona 08
((SELECT id FROM zonas WHERE codigo = '08'), '01', 'Inst.educativa Ciudad Boquia',    'kr 6a # 63 - 50 sec. e ciudadela del café',    42),
((SELECT id FROM zonas WHERE codigo = '08'), '02', 'Liceo Cial Aquilino Bedoya',      'av 30 de agosto #. 62 - 59',                   19),
-- Zona 09
((SELECT id FROM zonas WHERE codigo = '09'), '01', 'Ie Remigio Antonio Cañarte',      'kr 22 b # 29 - 40 br. el poblado i etapa',    19),
((SELECT id FROM zonas WHERE codigo = '09'), '02', 'I.e.samaria',                     'kr 34 # 32c - 35 samaria i',                   21),
((SELECT id FROM zonas WHERE codigo = '09'), '03', 'Centro Educ.naranjito',           'cl 66 d # 44 - 45 vereda naranjito',           28),
-- Zona 10
((SELECT id FROM zonas WHERE codigo = '10'), '01', 'Colegio Oficial Ciudadela Cuba',  'cl. 71 cra. 28 barrio los cristales',          32),
((SELECT id FROM zonas WHERE codigo = '10'), '02', 'Ctro Educ.bayron Gaviria',        'cl 75 # 36f - 26 los héroes',                  37),
((SELECT id FROM zonas WHERE codigo = '10'), '03', 'Colegio Basico San Joaquin',      'cl 86 # 36 - 40 san joaquín',                  27),
((SELECT id FROM zonas WHERE codigo = '10'), '04', 'Col.soffy Hernandez Marin',       'kr 26 b # 74 a 35 cuba',                       11),
((SELECT id FROM zonas WHERE codigo = '10'), '05', 'Col Rodrigo Arenas Betancur',     'cl 80 no 36b-30',                              3),
-- Zona 11
((SELECT id FROM zonas WHERE codigo = '11'), '01', 'Uni.libre De Pereira Belmonte',   'av de las américas sector belmonte',           17),
((SELECT id FROM zonas WHERE codigo = '11'), '02', 'Ctro Educ.luis Carlos Gonzalez',  'cl 82 kr 17 bis gamma ii',                     16),
((SELECT id FROM zonas WHERE codigo = '11'), '03', 'Col.basico Alfonso Jaramillo',    'kr. 25 #. 77 - 18 br. corales',                27),
((SELECT id FROM zonas WHERE codigo = '11'), '04', 'Inst.educ.escolar San Fernando',  'cl 70 #. 23b - 20 cuba',                       38),
((SELECT id FROM zonas WHERE codigo = '11'), '05', 'Centro Educativo Juan Xxiii',     'kr. 23 bis #.74 - 40 cuba',                    24),
-- Zona 90
((SELECT id FROM zonas WHERE codigo = '90'), '01', 'Col.inem Felipe Perez Jardin 1',  'barrio el jardin etapa 1',                     31),
-- Zona 98
((SELECT id FROM zonas WHERE codigo = '98'), '01', 'Carcel',                          'kr. 8a #. 41 - 97',                            1),
-- Zona 99 (corregimientos rurales)
((SELECT id FROM zonas WHERE codigo = '99'), '05', 'Altagracia',                      'ctro educativo maría cristina gomez',          12),
((SELECT id FROM zonas WHERE codigo = '99'), '08', 'La Florida',                      'i.e héctor angel arcila',                      6),
((SELECT id FROM zonas WHERE codigo = '99'), '09', 'San Jose',                        'cent doc san jose otun via la florida',        3),
((SELECT id FROM zonas WHERE codigo = '99'), '10', 'El Chocho',                       'ctro educativo ana arango de uribe',           3),
((SELECT id FROM zonas WHERE codigo = '99'), '13', 'La Bella',                        'i.e. la bella',                                5),
((SELECT id FROM zonas WHERE codigo = '99'), '21', 'Mundo Nuevo',                     'instituto docente mundo nuevo',                3),
((SELECT id FROM zonas WHERE codigo = '99'), '22', 'La Graminea',                     'ctro educativo la gramínea',                   2),
((SELECT id FROM zonas WHERE codigo = '99'), '23', 'El Manzano',                      'inst. docente el manzano',                     2),
((SELECT id FROM zonas WHERE codigo = '99'), '30', 'Tribunas Corcega',                'col. oficial josé antonio galán',              12),
((SELECT id FROM zonas WHERE codigo = '99'), '34', 'Arabia',                          'inst agrícola san francisco de asis',          6),
((SELECT id FROM zonas WHERE codigo = '99'), '39', 'Betulia',                         'ctro docente betulia',                         3),
((SELECT id FROM zonas WHERE codigo = '99'), '40', 'Yarumal',                         'inst. docente yarumal',                        2),
((SELECT id FROM zonas WHERE codigo = '99'), '41', 'Puerto Caldas Puente Bolivar',    'c.e. enrique millán rubio',                    9),
((SELECT id FROM zonas WHERE codigo = '99'), '48', 'Caimalito',                       'i.e. gabriel trujillo',                        9),
((SELECT id FROM zonas WHERE codigo = '99'), '61', 'Combia Baja',                     'esc. el placer',                               7),
((SELECT id FROM zonas WHERE codigo = '99'), '65', 'La Honda',                        'ctro educativo la honda',                      1),
((SELECT id FROM zonas WHERE codigo = '99'), '70', 'La Convencion',                   'esc. san vicente',                             3),
((SELECT id FROM zonas WHERE codigo = '99'), '74', 'Combia Alta',                     'instituto educativo el pital',                 5),
((SELECT id FROM zonas WHERE codigo = '99'), '85', 'Cerritos',                        'colegio comunitario cerritos',                 18),
((SELECT id FROM zonas WHERE codigo = '99'), '90', 'Morelia',                         'ctro docente morelia',                         7),
((SELECT id FROM zonas WHERE codigo = '99'), '96', 'La Estrella La Palmilla',         'esc. rural la estrella - la palmilla',         4);
