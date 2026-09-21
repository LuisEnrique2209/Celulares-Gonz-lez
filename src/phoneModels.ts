// Base de datos completa de marcas y modelos populares en México (desde 2020)

export interface PhoneModel {
  brand: string;
  models: string[];
}

export const PHONE_BRANDS: PhoneModel[] = [
  {
    brand: 'Apple',
    models: [
      // 2024
      'iPhone 16 Pro Max', 'iPhone 16 Pro', 'iPhone 16 Plus', 'iPhone 16',
      'iPhone 15 Pro Max', 'iPhone 15 Pro', 'iPhone 15 Plus', 'iPhone 15',
      // 2023
      'iPhone 14 Pro Max', 'iPhone 14 Pro', 'iPhone 14 Plus', 'iPhone 14',
      // 2022
      'iPhone 13 Pro Max', 'iPhone 13 Pro', 'iPhone 13', 'iPhone 13 Mini',
      'iPhone SE (3ra generación)',
      // 2021
      'iPhone 12 Pro Max', 'iPhone 12 Pro', 'iPhone 12', 'iPhone 12 Mini',
      'iPhone SE (2da generación)',
      // 2020
      'iPhone 11 Pro Max', 'iPhone 11 Pro', 'iPhone 11',
      'iPhone XS Max', 'iPhone XS', 'iPhone XR',
      'iPhone X', 'iPhone 8 Plus', 'iPhone 8',
      'iPhone 7 Plus', 'iPhone 7',
      'iPhone 6s Plus', 'iPhone 6s',
      'iPhone 6 Plus', 'iPhone 6',
      'iPhone 5s', 'iPhone 5c', 'iPhone 5',
      'iPhone 4s', 'iPhone 4',
      'iPhone 3GS', 'iPhone 3G', 'iPhone',
    ]
  },
  {
    brand: 'Samsung',
    models: [
      // Galaxy S Series 2024
      'Galaxy S24 Ultra', 'Galaxy S24+', 'Galaxy S24', 'Galaxy S24 FE',
      // Galaxy S Series 2023
      'Galaxy S23 Ultra', 'Galaxy S23+', 'Galaxy S23', 'Galaxy S23 FE',
      // Galaxy S Series 2022
      'Galaxy S22 Ultra', 'Galaxy S22+', 'Galaxy S22',
      // Galaxy S Series 2021
      'Galaxy S21 Ultra', 'Galaxy S21+', 'Galaxy S21', 'Galaxy S21 FE',
      // Galaxy S Series 2020
      'Galaxy S20 Ultra', 'Galaxy S20+', 'Galaxy S20', 'Galaxy S20 FE',
      // Galaxy Note Series
      'Galaxy Note 20 Ultra', 'Galaxy Note 20',
      'Galaxy Note 10+', 'Galaxy Note 10',
      'Galaxy Note 10 Lite',
      // Galaxy Z Series (Foldables)
      'Galaxy Z Fold 6', 'Galaxy Z Fold 5', 'Galaxy Z Fold 4', 'Galaxy Z Fold 3',
      'Galaxy Z Flip 6', 'Galaxy Z Flip 5', 'Galaxy Z Flip 4', 'Galaxy Z Flip 3',
      // Galaxy A Series 2024
      'Galaxy A56', 'Galaxy A36', 'Galaxy A26', 'Galaxy A16', 'Galaxy A06',
      // Galaxy A Series 2023
      'Galaxy A55', 'Galaxy A35', 'Galaxy A25', 'Galaxy A15', 'Galaxy A05',
      'Galaxy A54', 'Galaxy A34', 'Galaxy A24', 'Galaxy A14', 'Galaxy A04',
      // Galaxy A Series 2022
      'Galaxy A53', 'Galaxy A33', 'Galaxy A23', 'Galaxy A13', 'Galaxy A03',
      'Galaxy A73', 'Galaxy A72', 'Galaxy A52', 'Galaxy A52s', 'Galaxy A32',
      'Galaxy A22', 'Galaxy A12', 'Galaxy A02', 'Galaxy A02s',
      // Galaxy A Series 2021
      'Galaxy A71', 'Galaxy A51', 'Galaxy A31', 'Galaxy A21', 'Galaxy A21s',
      'Galaxy A11', 'Galaxy A01', 'Galaxy A01 Core',
      // Galaxy A Series 2020
      'Galaxy A91', 'Galaxy A90', 'Galaxy A80', 'Galaxy A70', 'Galaxy A70s',
      'Galaxy A60', 'Galaxy A50', 'Galaxy A50s', 'Galaxy A40', 'Galaxy A30',
      'Galaxy A30s', 'Galaxy A20', 'Galaxy A20s', 'Galaxy A10', 'Galaxy A10s',
      'Galaxy A10e',
      // Galaxy M Series
      'Galaxy M55', 'Galaxy M54', 'Galaxy M34', 'Galaxy M14',
      'Galaxy M53', 'Galaxy M33', 'Galaxy M23', 'Galaxy M13',
      'Galaxy M52', 'Galaxy M32', 'Galaxy M22', 'Galaxy M12',
      'Galaxy M51', 'Galaxy M31', 'Galaxy M21', 'Galaxy M11',
      'Galaxy M30', 'Galaxy M30s', 'Galaxy M20', 'Galaxy M10',
      // Galaxy F Series
      'Galaxy F54', 'Galaxy F34', 'Galaxy F14',
      'Galaxy F52', 'Galaxy F41', 'Galaxy F22', 'Galaxy F12',
      'Galaxy F62', 'Galaxy F42', 'Galaxy F02',
    ]
  },
  {
    brand: 'Xiaomi',
    models: [
      // Xiaomi Flagship 2024
      'Xiaomi 14 Ultra', 'Xiaomi 14 Pro', 'Xiaomi 14', 'Xiaomi 14 Civi',
      // Xiaomi Flagship 2023
      'Xiaomi 13 Ultra', 'Xiaomi 13 Pro', 'Xiaomi 13', 'Xiaomi 13 Lite',
      'Xiaomi 13T Pro', 'Xiaomi 13T',
      // Xiaomi Flagship 2022
      'Xiaomi 12 Pro', 'Xiaomi 12', 'Xiaomi 12X', 'Xiaomi 12S Ultra',
      'Xiaomi 12S Pro', 'Xiaomi 12S',
      // Xiaomi Flagship 2021
      'Xiaomi 11 Ultra', 'Xiaomi 11 Pro', 'Xiaomi 11', 'Xiaomi 11 Lite',
      'Xiaomi 11 Lite 5G', 'Xiaomi 11T Pro', 'Xiaomi 11T',
      // Xiaomi Flagship 2020
      'Xiaomi 10 Pro', 'Xiaomi 10', 'Xiaomi 10 Lite',
      'Xiaomi Mi 9 Pro', 'Xiaomi Mi 9', 'Xiaomi Mi 9 Lite',
      'Xiaomi Mi 9T Pro', 'Xiaomi Mi 9T',
      'Xiaomi Mi 8 Pro', 'Xiaomi Mi 8', 'Xiaomi Mi 8 Lite',
      'Xiaomi Mi 8 SE', 'Xiaomi Mi 8 Explorer',
      // Redmi Note Series 2024
      'Redmi Note 13 Pro+', 'Redmi Note 13 Pro', 'Redmi Note 13',
      'Redmi Note 13R', 'Redmi Note 13R Pro',
      // Redmi Note Series 2023
      'Redmi Note 12 Pro+', 'Redmi Note 12 Pro', 'Redmi Note 12',
      'Redmi Note 12 Turbo', 'Redmi Note 12S', 'Redmi Note 12 5G',
      // Redmi Note Series 2022
      'Redmi Note 11 Pro+', 'Redmi Note 11 Pro', 'Redmi Note 11',
      'Redmi Note 11S', 'Redmi Note 11 5G', 'Redmi Note 11E',
      // Redmi Note Series 2021
      'Redmi Note 10 Pro', 'Redmi Note 10', 'Redmi Note 10S',
      'Redmi Note 10 5G', 'Redmi Note 10 Lite',
      'Redmi Note 9 Pro', 'Redmi Note 9', 'Redmi Note 9S',
      'Redmi Note 9 Pro Max',
      // Redmi Note Series 2020
      'Redmi Note 8 Pro', 'Redmi Note 8', 'Redmi Note 8T',
      'Redmi Note 7 Pro', 'Redmi Note 7', 'Redmi Note 7S',
      // Redmi Number Series
      'Redmi 14C', 'Redmi 14', 'Redmi 14R',
      'Redmi 13C', 'Redmi 13', 'Redmi 13R',
      'Redmi 12C', 'Redmi 12', 'Redmi 12 5G',
      'Redmi 11 Prime', 'Redmi 11',
      'Redmi 10A', 'Redmi 10', 'Redmi 10 5G',
      'Redmi 10C', 'Redmi 10 Power',
      'Redmi 9A', 'Redmi 9', 'Redmi 9C', 'Redmi 9 Power',
      'Redmi 9T', 'Redmi 9i',
      'Redmi 8A', 'Redmi 8', 'Redmi 8A Dual',
      'Redmi 7A', 'Redmi 7',
      'Redmi 6A', 'Redmi 6', 'Redmi 6 Pro',
      // Redmi A Series
      'Redmi A4', 'Redmi A3', 'Redmi A3X',
      'Redmi A2', 'Redmi A2+',
      'Redmi A1', 'Redmi A1+',
      // POCO X Series
      'POCO X7 Pro', 'POCO X7', 'POCO X7 Neo',
      'POCO X6 Pro', 'POCO X6', 'POCO X6 Neo',
      'POCO X5 Pro', 'POCO X5', 'POCO X5 Neo',
      'POCO X4 Pro', 'POCO X4 GT', 'POCO X4 Neo',
      'POCO X3 Pro', 'POCO X3 GT', 'POCO X3 NFC',
      // POCO F Series
      'POCO F7 Pro', 'POCO F7',
      'POCO F6 Pro', 'POCO F6',
      'POCO F5 Pro', 'POCO F5',
      'POCO F4 GT', 'POCO F4',
      'POCO F3', 'POCO F2 Pro',
      // POCO M Series
      'POCO M7 Pro', 'POCO M7',
      'POCO M6 Pro', 'POCO M6', 'POCO M6 Pro 5G',
      'POCO M5', 'POCO M5s', 'POCO M4 Pro', 'POCO M4',
      'POCO M3 Pro', 'POCO M3',
      // POCO C Series
      'POCO C75', 'POCO C70', 'POCO C65', 'POCO C61', 'POCO C60',
      'POCO C55', 'POCO C50', 'POCO C51',
      'POCO C40', 'POCO C31', 'POCO C3',
    ]
  },
  {
    brand: 'Motorola',
    models: [
      // Edge Series 2024
      'Edge 50 Ultra', 'Edge 50 Pro', 'Edge 50', 'Edge 50 Fusion', 'Edge 50 Neo',
      // Edge Series 2023
      'Edge 40 Pro', 'Edge 40', 'Edge 40 Neo',
      // Edge Series 2022
      'Edge 30 Ultra', 'Edge 30 Pro', 'Edge 30', 'Edge 30 Neo', 'Edge 30 Fusion',
      // Edge Series 2021
      'Edge 20 Pro', 'Edge 20', 'Edge 20 Lite',
      // Edge Series 2020
      'Edge+', 'Edge', 'Edge Lite',
      // Razr Series
      'Razr 50 Ultra', 'Razr 50',
      'Razr 40 Ultra', 'Razr 40',
      'Razr 2023', 'Razr 2022', 'Razr 5G', 'Razr',
      // Moto G Series 2024
      'Moto G85', 'Moto G84', 'Moto G75', 'Moto G73',
      'Moto G64', 'Moto G54', 'Moto G45', 'Moto G34',
      'Moto G24', 'Moto G24 Power',
      'Moto G14', 'Moto G13',
      // Moto G Series 2023
      'Moto G82', 'Moto G72', 'Moto G52', 'Moto G42', 'Moto G32', 'Moto G22',
      'Moto G12',
      // Moto G Series 2022
      'Moto G71', 'Moto G62', 'Moto G51', 'Moto G41', 'Moto G31', 'Moto G21',
      'Moto G11', 'Moto G10', 'Moto G100',
      // Moto G Series 2021
      'Moto G Power (2021)', 'Moto G Stylus (2021)', 'Moto G Play (2021)',
      'Moto G Pure', 'Moto G100', 'Moto G50', 'Moto G30', 'G20', 'G10',
      // Moto G Series 2020
      'Moto G Power (2020)', 'Moto G Stylus (2020)', 'Moto G Play (2020)',
      'Moto G Pro', 'Moto G Fast', 'Moto G8', 'Moto G8 Power', 'Moto G8 Plus',
      'Moto G8 Power Lite', 'Moto G7', 'Moto G7 Power', 'Moto G7 Plus', 'Moto G7 Play',
      // Moto E Series
      'Moto E22', 'Moto E22i',
      'Moto E13', 'Moto E13 Plus',
      'Moto E32', 'Moto E32s',
      'Moto E40', 'Moto E20',
      'Moto E7', 'Moto E7 Plus', 'Moto E7 Power', 'Moto E7i Power',
      'Moto E6', 'Moto E6 Plus', 'Moto E6s', 'Moto E6 Play',
      // One Series
      'One Fusion+', 'One Fusion', 'One Action', 'One Vision', 'One Hyper',
      'One Macro', 'One Zoom',
    ]
  },
  {
    brand: 'Huawei',
    models: [
      // P Series 2024
      'Pura 70 Ultra', 'Pura 70 Pro', 'Pura 70',
      'P60 Pro', 'P60', 'P60 Art',
      // P Series 2023
      'P50 Pro', 'P50', 'P50 Pocket',
      // P Series 2022
      'P40 Pro+', 'P40 Pro', 'P40', 'P40 Lite',
      // P Series 2021
      'P30 Pro', 'P30', 'P30 Lite', 'P30 Lite New Edition',
      // P Series 2020
      'P20 Pro', 'P20', 'P20 Lite',
      // Mate Series
      'Mate 70 Pro+', 'Mate 70 Pro', 'Mate 70',
      'Mate 60 Pro+', 'Mate 60 Pro', 'Mate 60',
      'Mate 50 Pro', 'Mate 50', 'Mate 50 RS',
      'Mate 40 Pro+', 'Mate 40 Pro', 'Mate 40', 'Mate 40 Lite',
      'Mate 30 Pro', 'Mate 30', 'Mate 30 Lite',
      'Mate 20 Pro', 'Mate 20', 'Mate 20 Lite', 'Mate 20 X',
      'Mate 10 Pro', 'Mate 10', 'Mate 10 Lite',
      // Nova Series
      'Nova 13 Pro', 'Nova 13', 'Nova 13i',
      'Nova 12 Pro', 'Nova 12', 'Nova 12i',
      'Nova 11 Pro', 'Nova 11', 'Nova 11i', 'Nova 11 SE',
      'Nova 10 Pro', 'Nova 10', 'Nova 10 SE',
      'Nova 9', 'Nova 9 SE',
      'Nova 8', 'Nova 8i', 'Nova 8 SE',
      'Nova 7', 'Nova 7i', 'Nova 7 SE', 'Nova 7 Pro',
      'Nova 6', 'Nova 6 SE', 'Nova 6 5G',
      'Nova 5', 'Nova 5i', 'Nova 5 Pro', 'Nova 5T',
      'Nova 4', 'Nova 4e', 'Nova 3', 'Nova 3i', 'Nova 3e',
      // Y Series
      'Y9 Prime', 'Y9a', 'Y9s', 'Y9', 'Y9 2019',
      'Y7a', 'Y7p', 'Y7 Prime', 'Y7 Pro', 'Y7',
      'Y6p', 'Y6s', 'Y6 Prime', 'Y6 Pro', 'Y6',
      'Y5p', 'Y5',
      // P Smart Series
      'P Smart 2021', 'P Smart 2020', 'P Smart+', 'P Smart',
      // Enjoy Series
      'Enjoy 70', 'Enjoy 60',
      'Enjoy 20', 'Enjoy 10', 'Enjoy 10e', 'Enjoy 10 Plus',
      'Enjoy 9', 'Enjoy 9e', 'Enjoy 9s',
      // Honor (sub-brand)
      'Honor 90', 'Honor 90 Pro', 'Honor 90 Lite',
      'Honor 80', 'Honor 80 Pro', 'Honor 80 SE',
      'Honor 70', 'Honor 70 Pro',
      'Honor 60', 'Honor 60 Pro',
      'Honor 50', 'Honor 50 Pro',
      'Honor 30', 'Honor 30 Pro', 'Honor 30S',
      'Honor 20', 'Honor 20 Pro', 'Honor 20 Lite',
      'Honor 10', 'Honor 10 Lite',
      'Honor View 30', 'Honor View 20', 'Honor View 10',
      'Honor Play', 'Honor Play 4T', 'Honor Play 5T',
    ]
  },
  {
    brand: 'OPPO',
    models: [
      // Find X Series 2024
      'Find X8 Pro', 'Find X8',
      'Find X7 Ultra', 'Find X7', 'Find X7 Lite',
      // Find X Series 2023
      'Find X6 Pro', 'Find X6', 'Find X6 Lite',
      // Find X Series 2022
      'Find X5 Pro', 'Find X5', 'Find X5 Lite',
      // Find X Series 2021
      'Find X3 Pro', 'Find X3', 'Find X3 Lite',
      // Find X Series 2020
      'Find X2 Pro', 'Find X2', 'Find X2 Lite',
      'Find X', 'Find X Lamborghini',
      // Reno Series 2024
      'Reno 13 Pro', 'Reno 13', 'Reno 13F',
      'Reno 12 Pro', 'Reno 12', 'Reno 12F',
      'Reno 11 Pro', 'Reno 11', 'Reno 11F',
      // Reno Series 2023
      'Reno 10 Pro+', 'Reno 10 Pro', 'Reno 10', 'Reno 10 5G',
      // Reno Series 2022
      'Reno 9 Pro+', 'Reno 9 Pro', 'Reno 9', 'Reno 9A',
      'Reno 8 Pro', 'Reno 8', 'Reno 8T', 'Reno 8 Lite',
      // Reno Series 2021
      'Reno 7 Pro', 'Reno 7', 'Reno 7 Lite',
      'Reno 6 Pro', 'Reno 6', 'Reno 6 Lite',
      // Reno Series 2020
      'Reno 5 Pro', 'Reno 5', 'Reno 5 Lite',
      'Reno 4 Pro', 'Reno 4', 'Reno 4 Lite',
      'Reno 3 Pro', 'Reno 3', 'Reno 3 Lite',
      'Reno 2', 'Reno 2 F', 'Reno 2 Z',
      'Reno', 'Reno 10x Zoom', 'Reno Pro',
      // A Series
      'A5 Pro', 'A5',
      'A3 Pro', 'A3', 'A3x',
      'A98', 'A78', 'A77', 'A76', 'A74',
      'A58', 'A57', 'A56', 'A55', 'A54', 'A53',
      'A38', 'A37', 'A36', 'A35', 'A34', 'A33',
      'A18', 'A17', 'A16', 'A15', 'A14', 'A13', 'A12',
      // F Series
      'F27 Pro', 'F27',
      'F25 Pro', 'F23', 'F21 Pro', 'F21 Pro+',
      'F19 Pro', 'F19 Pro+', 'F19',
      'F17 Pro', 'F17',
      // K Series
      'K12', 'K11', 'K10', 'K9', 'K7',
      // Realme (sub-brand)
      'Realme GT 7 Pro', 'Realme GT 7',
      'Realme GT 6 Pro', 'Realme GT 6',
      'Realme GT 5 Pro', 'Realme GT 5',
      'Realme GT 3', 'Realme GT 2 Pro', 'Realme GT 2',
      'Realme GT Neo 6', 'Realme GT Neo 5', 'Realme GT Neo 3',
      'Realme 13 Pro+', 'Realme 13 Pro', 'Realme 13',
      'Realme 12 Pro+', 'Realme 12 Pro', 'Realme 12',
      'Realme 11 Pro+', 'Realme 11 Pro', 'Realme 11',
      'Realme 10 Pro+', 'Realme 10 Pro', 'Realme 10',
      'Realme 9 Pro+', 'Realme 9 Pro', 'Realme 9',
      'Realme 9i', 'Realme 9i 5G',
      'Realme 8 Pro', 'Realme 8', 'Realme 8i', 'Realme 8 5G',
      'Realme 7 Pro', 'Realme 7', 'Realme 7i', 'Realme 7 5G',
      'Realme 6 Pro', 'Realme 6', 'Realme 6i',
      'Realme 5 Pro', 'Realme 5', 'Realme 5i', 'Realme 5s',
      'Realme C75', 'Realme C67', 'Realme C65', 'Realme C63',
      'Realme C55', 'Realme C53', 'Realme C51',
      'Realme C35', 'Realme C33', 'Realme C31', 'Realme C30',
      'Realme C25', 'Realme C21', 'Realme C20', 'Realme C17',
      'Realme C15', 'Realme C12', 'Realme C11',
    ]
  },
  {
    brand: 'Vivo',
    models: [
      // X Series 2024
      'X200 Pro', 'X200', 'X200 Pro mini',
      'X100 Pro', 'X100', 'X100 Ultra',
      // X Series 2023
      'X90 Pro', 'X90', 'X90 Pro+',
      // X Series 2022
      'X80 Pro', 'X80', 'X80 Pro+',
      // X Series 2021
      'X70 Pro+', 'X70 Pro', 'X70',
      // X Series 2020
      'X60 Pro+', 'X60 Pro', 'X60', 'X60t Pro',
      // X Series 2019
      'X50 Pro+', 'X50 Pro', 'X50', 'X50e',
      // X Series 2018
      'X30 Pro', 'X30', 'X30e',
      // X Series 2017
      'X27 Pro', 'X27', 'X23',
      // V Series 2024
      'V40 Pro', 'V40', 'V40e',
      'V30 Pro', 'V30', 'V30e', 'V30 Lite',
      // V Series 2023
      'V29 Pro', 'V29', 'V29e', 'V29 Lite',
      'V27 Pro', 'V27', 'V27e',
      // V Series 2022
      'V25 Pro', 'V25', 'V25e',
      'V23 Pro', 'V23', 'V23e',
      // V Series 2021
      'V21', 'V21e', 'V21 5G',
      'V20 Pro', 'V20', 'V20 SE',
      // V Series 2020
      'V19', 'V17 Pro', 'V17', 'V15 Pro', 'V15',
      // Y Series 2024
      'Y300 Pro', 'Y300', 'Y300e',
      'Y200 Pro', 'Y200', 'Y200e', 'Y200t',
      'Y100', 'Y100 5G', 'Y100i',
      'Y36', 'Y35', 'Y33s', 'Y33',
      'Y27', 'Y27 5G',
      'Y17s', 'Y17', 'Y16', 'Y15s', 'Y15',
      // Y Series 2023
      'Y55', 'Y55 5G',
      'Y35 (2022)', 'Y33s (2022)',
      'Y22', 'Y21', 'Y21t',
      'Y16 (2022)', 'Y15s (2022)',
      'Y02', 'Y02s',
      // Y Series 2022
      'Y78', 'Y77', 'Y76',
      'Y73', 'Y72', 'Y71', 'Y70',
      'Y51', 'Y51 (2021)', 'Y52', 'Y53',
      'Y31', 'Y30', 'Y30 Pro',
      'Y20', 'Y20i', 'Y20A', 'Y20G',
      'Y12s', 'Y12', 'Y12 (2021)', 'Y12s (2021)',
      'Y11', 'Y11s',
      // Y Series 2021
      'Y38', 'Y37', 'Y36',
      'Y28', 'Y28s',
      'Y19', 'Y19s',
      'Y03', 'Y03s',
      // T Series
      'T3 Pro', 'T3', 'T3x',
      'T2 Pro', 'T2', 'T2x',
      'T1 Pro', 'T1', 'T1x',
      // iQOO Series
      'iQOO 13 Pro', 'iQOO 13',
      'iQOO 12 Pro', 'iQOO 12',
      'iQOO 11 Pro', 'iQOO 11',
      'iQOO 10 Pro', 'iQOO 10',
      'iQOO 9 Pro', 'iQOO 9',
      'iQOO 8 Pro', 'iQOO 8',
      'iQOO 7', 'iQOO 7 Legend',
      'iQOO Neo 10', 'iQOO Neo 9', 'iQOO Neo 8', 'iQOO Neo 7',
      'iQOO Z10', 'iQOO Z9', 'iQOO Z8', 'iQOO Z7', 'iQOO Z6',
    ]
  },
  {
    brand: 'Google',
    models: [
      // Pixel 8 Series (2023)
      'Pixel 8 Pro', 'Pixel 8', 'Pixel 8a',
      // Pixel 7 Series (2022)
      'Pixel 7 Pro', 'Pixel 7', 'Pixel 7a',
      // Pixel 6 Series (2021)
      'Pixel 6 Pro', 'Pixel 6', 'Pixel 6a',
      // Pixel 5 Series (2020)
      'Pixel 5', 'Pixel 5a', 'Pixel 4a 5G',
      // Pixel 4 Series (2019)
      'Pixel 4 XL', 'Pixel 4', 'Pixel 4a',
      // Pixel 3 Series (2018)
      'Pixel 3 XL', 'Pixel 3', 'Pixel 3a XL', 'Pixel 3a',
      // Pixel 2 Series (2017)
      'Pixel 2 XL', 'Pixel 2',
      // Pixel (2016)
      'Pixel XL', 'Pixel',
    ]
  },
  {
    brand: 'OnePlus',
    models: [
      // 2024
      'OnePlus 12', 'OnePlus 12R',
      // 2023
      'OnePlus 11', 'OnePlus 11R',
      'OnePlus Open',
      // 2022
      'OnePlus 10 Pro', 'OnePlus 10T', 'OnePlus 10R',
      // 2021
      'OnePlus 9 Pro', 'OnePlus 9', 'OnePlus 9R', 'OnePlus 9RT',
      // 2020
      'OnePlus 8 Pro', 'OnePlus 8', 'OnePlus 8T',
      'OnePlus Nord', 'OnePlus Nord N10', 'OnePlus Nord N100',
      // 2019
      'OnePlus 7 Pro', 'OnePlus 7', 'OnePlus 7T', 'OnePlus 7T Pro',
      'OnePlus Nord N100',
      // Nord Series
      'Nord 3', 'Nord CE 3', 'Nord CE 3 Lite',
      'Nord 2T', 'Nord CE 2', 'Nord CE 2 Lite',
      'Nord 2', 'Nord CE',
      'Nord N30', 'Nord N30 5G',
      'Nord N20', 'Nord N200',
      'Nord N10', 'Nord N100',
      // Nord Series 2023-2024
      'Nord 4', 'Nord CE 4', 'Nord CE 4 Lite',
    ]
  },
  {
    brand: 'Honor',
    models: [
      // Magic Series 2024
      'Magic 7 Pro', 'Magic 7', 'Magic 7 Lite',
      'Magic 6 Pro', 'Magic 6', 'Magic 6 Lite',
      // Magic Series 2023
      'Magic 5 Pro', 'Magic 5', 'Magic 5 Lite',
      'Magic V2', 'Magic Vs2',
      // Magic Series 2022
      'Magic 4 Pro', 'Magic 4', 'Magic 4 Lite',
      'Magic V',
      // Magic Series 2021
      'Magic 3 Pro', 'Magic 3',
      // Number Series 2024
      '300 Pro', '300', '300 Smart',
      '200 Pro', '200', '200 Smart',
      // Number Series 2023
      '90 Pro', '90', '90 Lite',
      // Number Series 2022
      '80 Pro', '80', '80 Smart',
      // Number Series 2021
      '70 Pro', '70', '70 Smart',
      // Number Series 2020
      '60 Pro', '60', '60 Lite',
      '50 Pro', '50', '50 Lite',
      // X Series
      'X9c', 'X9b', 'X9a', 'X9',
      'X8c', 'X8b', 'X8a', 'X8',
      'X7b', 'X7',
      'X6b', 'X6a', 'X6',
      'X5', 'X5i',
      // Y Series
      'Y9a', 'Y9 Prime',
      'Y7a', 'Y7',
      'Y6p', 'Y6',
      'Y5p', 'Y5',
      // Play Series
      'Play 60', 'Play 50', 'Play 40', 'Play 30', 'Play 20',
      // View Series
      'View 50', 'View 40', 'View 30', 'View 20',
    ]
  },
  {
    brand: 'Sony',
    models: [
      // Xperia 1 Series
      'Xperia 1 VI', 'Xperia 1 V', 'Xperia 1 IV', 'Xperia 1 III', 'Xperia 1 II', 'Xperia 1',
      // Xperia 5 Series
      'Xperia 5 V', 'Xperia 5 IV', 'Xperia 5 III', 'Xperia 5 II', 'Xperia 5',
      // Xperia 10 Series
      'Xperia 10 VI', 'Xperia 10 V', 'Xperia 10 IV', 'Xperia 10 III', 'Xperia 10 II', 'Xperia 10',
      // Xperia Pro Series
      'Xperia Pro-I', 'Xperia Pro',
      // Xperia L Series
      'Xperia L4', 'Xperia L3',
      // Xperia XZ Series
      'Xperia XZ3', 'Xperia XZ2 Premium', 'Xperia XZ2', 'Xperia XZ2 Compact',
      'Xperia XZ1', 'Xperia XZ1 Compact',
      'Xperia XZ Premium', 'Xperia XZ', 'Xperia XZs',
      // Xperia X Series
      'Xperia X Performance', 'Xperia X', 'Xperia X Compact',
      'Xperia XA', 'Xperia XA Ultra', 'Xperia XA1', 'Xperia XA1 Ultra',
      'Xperia XA2', 'Xperia XA2 Ultra', 'Xperia XA2 Plus',
    ]
  },
  {
    brand: 'LG',
    models: [
      // V Series
      'V60 ThinQ', 'V50 ThinQ', 'V40 ThinQ', 'V35 ThinQ', 'V30', 'V30+',
      // G Series
      'G8 ThinQ', 'G8X ThinQ', 'G7 ThinQ', 'G7+', 'G6', 'G6+', 'G5', 'G5 SE',
      // Velvet Series
      'Velvet', 'Velvet 5G',
      // Wing Series
      'Wing',
      // K Series
      'K92', 'K92 5G', 'K72', 'K71', 'K62', 'K61', 'K52', 'K51', 'K51S',
      'K42', 'K41S', 'K40S', 'K40', 'K31', 'K30', 'K30+', 'K22', 'K20',
      // Q Series
      'Q70', 'Q60', 'Q52', 'Q51', 'Q31',
      // Stylo Series
      'Stylo 6', 'Stylo 5', 'Stylo 4',
      // Nexus (made by LG)
      'Nexus 5X', 'Nexus 4',
    ]
  },
  {
    brand: 'Nokia',
    models: [
      // X Series
      'X30', 'X30 5G', 'X20', 'X20 5G', 'X10', 'X10 5G',
      'XR20', 'XR20 5G',
      // G Series
      'G60', 'G60 5G', 'G50', 'G50 5G', 'G42', 'G42 5G',
      'G22', 'G21', 'G20',
      // C Series
      'C32', 'C31', 'C30', 'C22', 'C21', 'C20', 'C20 Plus',
      'C12', 'C11', 'C10',
      // Number Series
      '8.3', '8.1', '8 Sirocco',
      '7.2', '7.1', '7 Plus',
      '6.2', '6.1', '6.1 Plus',
      '5.4', '5.3', '5.1', '5.1 Plus',
      '4.2', '3.4', '3.2', '3.1', '3.1 Plus',
      '2.4', '2.3', '2.2', '2.1', '2',
      '1 Plus', '1.4', '1.3', '1',
    ]
  },
  {
    brand: 'Realme',
    models: [
      // GT Series
      'GT 5 Pro', 'GT 5', 'GT Neo 5', 'GT Neo 5 SE',
      'GT 3', 'GT Neo 3', 'GT Neo 3T',
      'GT 2 Pro', 'GT 2', 'GT Master',
      'GT Neo 2', 'GT Neo',
      // Number Series 2024
      '12 Pro+', '12 Pro', '12', '12x',
      // Number Series 2023
      '11 Pro+', '11 Pro', '11', '11x',
      // Number Series 2022
      '10 Pro+', '10 Pro', '10', '10s',
      // Number Series 2021
      '9 Pro+', '9 Pro', '9', '9i',
      // Number Series 2020
      '8 Pro', '8', '8i', '8 5G',
      '7 Pro', '7', '7i', '7 5G',
      '6 Pro', '6', '6i',
      '5 Pro', '5', '5i', '5s',
      // C Series
      'C67', 'C65', 'C63', 'C61', 'C60',
      'C55', 'C53', 'C51', 'C50',
      'C35', 'C33', 'C31', 'C30', 'C30s',
      'C25', 'C25s', 'C21', 'C21Y', 'C20', 'C20A',
      'C17', 'C15', 'C12', 'C11', 'C11 2021',
      // Narzo Series
      'Narzo 60 Pro', 'Narzo 60', 'Narzo 60x',
      'Narzo 50 Pro', 'Narzo 50', 'Narzo 50i', 'Narzo 50A',
      'Narzo 30 Pro', 'Narzo 30', 'Narzo 30A',
      'Narzo 20 Pro', 'Narzo 20', 'Narzo 20A',
      'Narzo 10', 'Narzo 10A',
    ]
  },
  {
    brand: 'ZTE',
    models: [
      // Axon Series
      'Axon 60 Ultra', 'Axon 60',
      'Axon 50 Ultra', 'Axon 50',
      'Axon 40 Ultra', 'Axon 40 Pro', 'Axon 40',
      'Axon 30 Ultra', 'Axon 30', 'Axon 30 Pro',
      'Axon 20 5G', 'Axon 20',
      'Axon 11', 'Axon 11 SE',
      'Axon 10 Pro', 'Axon 10',
      // Blade Series
      'Blade V50', 'Blade V50 Design',
      'Blade V40', 'Blade V40 Design',
      'Blade V30', 'Blade V30 Design',
      'Blade A73', 'Blade A72', 'Blade A71',
      'Blade A53', 'Blade A52', 'Blade A51',
      'Blade A33', 'Blade A32', 'Blade A31',
      // Nubia (sub-brand)
      'Nubia Z60 Ultra', 'Nubia Z60',
      'Nubia Z50 Ultra', 'Nubia Z50',
      'Nubia Z40 Pro', 'Nubia Z40',
      'Nubia Red Magic 8 Pro', 'Nubia Red Magic 8',
      'Nubia Red Magic 7 Pro', 'Nubia Red Magic 7',
    ]
  },
  {
    brand: 'TCL',
    models: [
      // 60 Series
      '60 SE', '60 Pro', '60', '60+ 5G',
      // 50 Series
      '50 XL', '50 Pro', '50', '50 SE',
      // 40 Series
      '40 SE', '40', '40+', '40 Pro',
      // 30 Series
      '30 SE', '30', '30+', '30 Pro',
      // 20 Series
      '20 SE', '20', '20 Pro', '20 Pro 5G',
      // 10 Series
      '10 Pro', '10', '10L', '10 Plus',
      // Tab Series
      'Tab 10', 'Tab 8',
    ]
  },
  {
    brand: 'Alcatel',
    models: [
      // 3 Series
      '3V (2023)', '3V (2022)', '3V (2021)',
      '3L (2022)', '3L (2021)',
      '3T (2022)', '3T (2021)',
      // 1 Series
      '1SE (2023)', '1SE (2022)',
      '1B (2022)', '1B (2021)', '1B (2020)',
      '1V (2021)', '1V (2020)',
      '1S (2022)', '1S (2021)', '1S (2020)',
      // Joy Series
      'Joy 3', 'Joy 2+', 'Joy 2', 'Joy',
      // A Series
      'A7 XL', 'A7', 'A5 LED', 'A5', 'A3 Plus', 'A3',
    ]
  },
  {
    brand: 'Infinix',
    models: [
      // Note Series
      'Note 40 Pro+', 'Note 40 Pro', 'Note 40', 'Note 40X',
      'Note 30 Pro', 'Note 30', 'Note 30i',
      'Note 12 Pro', 'Note 12', 'Note 12i',
      'Note 11 Pro', 'Note 11', 'Note 11s',
      'Note 10 Pro', 'Note 10', 'Note 8', 'Note 7', 'Note 5',
      // Hot Series
      'Hot 40 Pro', 'Hot 40', 'Hot 40i',
      'Hot 30', 'Hot 30i',
      'Hot 20', 'Hot 20i', 'Hot 20 Play', 'Hot 20S',
      'Hot 12 Pro', 'Hot 12', 'Hot 12 Play', 'Hot 11', 'Hot 11S',
      'Hot 10', 'Hot 10 Play', 'Hot 9', 'Hot 9 Play',
      // Smart Series
      'Smart 8', 'Smart 8 HD', 'Smart 8 Plus',
      'Smart 7', 'Smart 7 HD', 'Smart 7 Plus',
      'Smart 6', 'Smart 6 HD', 'Smart 6 Plus',
      'Smart 5', 'Smart 5 HD', 'Smart 5 Plus',
      // Zero Series
      'Zero 30', 'Zero 20', 'Zero 5G',
    ]
  },
  {
    brand: 'Tecno',
    models: [
      // Phantom Series
      'Phantom X2 Pro', 'Phantom X2', 'Phantom X',
      'Phantom V Fold', 'Phantom V Flip',
      // Camon Series
      'Camon 20 Pro', 'Camon 20', 'Camon 20 Premier',
      'Camon 19 Pro', 'Camon 19', 'Camon 19 Neo',
      'Camon 18 Premier', 'Camon 18 Pro', 'Camon 18', 'Camon 18P',
      'Camon 17 Pro', 'Camon 17', 'Camon 17P',
      'Camon 16 Premier', 'Camon 16 Pro', 'Camon 16', 'Camon 16S',
      // Spark Series
      'Spark 20 Pro', 'Spark 20', 'Spark 20C', 'Spark 20 Pro+',
      'Spark 10 Pro', 'Spark 10', 'Spark 10C',
      'Spark 9 Pro', 'Spark 9', 'Spark 9T',
      'Spark 8 Pro', 'Spark 8', 'Spark 8C', 'Spark 8P',
      // Pop Series
      'Pop 8', 'Pop 7 Pro', 'Pop 7', 'Pop 7P',
      'Pop 6 Pro', 'Pop 6', 'Pop 6S',
      'Pop 5 Pro', 'Pop 5', 'Pop 5C',
      // P Series
      'P35', 'P36', 'P37',
    ]
  },
  {
    brand: 'Nothing',
    models: [
      'Phone (2a)', 'Phone (2)', 'Phone (1)',
    ]
  },
  {
    brand: 'Asus',
    models: [
      // ROG Phone Series
      'ROG Phone 8 Pro', 'ROG Phone 8',
      'ROG Phone 7 Ultimate', 'ROG Phone 7',
      'ROG Phone 6 Pro', 'ROG Phone 6', 'ROG Phone 6D',
      'ROG Phone 5s', 'ROG Phone 5s Pro',
      'ROG Phone 5', 'ROG Phone 5 Pro',
      // Zenfone Series
      'Zenfone 11 Ultra', 'Zenfone 11',
      'Zenfone 10', 'Zenfone 10 Pro',
      'Zenfone 9',
      'Zenfone 8', 'Zenfone 8 Flip', 'Zenfone 8 Pro',
    ]
  },
  {
    brand: 'Lenovo',
    models: [
      // Legion Phone
      'Legion Phone Duel 2', 'Legion Phone Duel', 'Legion Phone Pro',
      // K Series
      'K14', 'K14+', 'K13', 'K13 Pro', 'K12', 'K12 Pro',
      // Note Series
      'Note 8', 'Note 7', 'Note 6', 'Note 5',
    ]
  },
  {
    brand: 'BlackBerry',
    models: [
      'Key2 LE', 'Key2', 'KeyOne', 'Motion', 'Aurora', 'DTEK60', 'DTEK50',
    ]
  },
  {
    brand: 'CAT',
    models: [
      'S75', 'S62 Pro', 'S42 H+', 'S42', 'S22 Flip', 'S61', 'S52', 'S41',
    ]
  },
];

// Función para obtener modelos de una marca
export function getModelsByBrand(brand: string): string[] {
  const brandData = PHONE_BRANDS.find(b => b.brand === brand);
  return brandData ? brandData.models : [];
}

// Función para obtener todas las marcas
export function getAllBrands(): string[] {
  return PHONE_BRANDS.map(b => b.brand);
}

// Función para agregar un modelo personalizado
export function addCustomModel(brand: string, model: string): void {
  const brandData = PHONE_BRANDS.find(b => b.brand === brand);
  if (brandData && !brandData.models.includes(model)) {
    brandData.models.unshift(model); // Agregar al inicio
  }
}

// Función para agregar una marca personalizada
export function addCustomBrand(brand: string): void {
  if (!PHONE_BRANDS.find(b => b.brand === brand)) {
    PHONE_BRANDS.unshift({ brand, models: [] });
  }
}
