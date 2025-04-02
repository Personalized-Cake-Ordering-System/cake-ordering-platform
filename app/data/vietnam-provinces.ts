export interface District {
    name: string;
    code: string;
}

export interface Province {
    name: string;
    code: string;
    districts: District[];
}

export const vietnamProvinces: Province[] = [

    {
        name: "TP. Hồ Chí Minh",
        code: "HCM",
        districts: [
            { name: "Quận 1", code: "Q1" },
            { name: "Quận 3", code: "Q3" },
            { name: "Quận 4", code: "Q4" },
            { name: "Quận 5", code: "Q5" },
            { name: "Quận 6", code: "Q6" },
            { name: "Quận 7", code: "Q7" },
            { name: "Quận 8", code: "Q8" },
            { name: "Quận 10", code: "Q10" },
            { name: "Quận 11", code: "Q11" },
            { name: "Quận 12", code: "Q12" },
            { name: "Thủ Đức", code: "TD" },
            { name: "Bình Thạnh", code: "BT" },
            { name: "Gò Vấp", code: "GV" },
            { name: "Phú Nhuận", code: "PN" },
            { name: "Tân Bình", code: "TB" },
            { name: "Tân Phú", code: "TP" }
        ]
    }
    // ,
    // {
    //     name: "Đà Nẵng",
    //     code: "DN",
    //     districts: [
    //         { name: "Hải Châu", code: "HC" },
    //         { name: "Thanh Khê", code: "TK" },
    //         { name: "Sơn Trà", code: "ST" },
    //         { name: "Ngũ Hành Sơn", code: "NHS" },
    //         { name: "Liên Chiểu", code: "LC" },
    //         { name: "Cẩm Lệ", code: "CL" }
    //     ]
    // },
    // {
    //     name: "Hải Phòng",
    //     code: "HP",
    //     districts: [
    //         { name: "Hồng Bàng", code: "HB" },
    //         { name: "Ngô Quyền", code: "NQ" },
    //         { name: "Lê Chân", code: "LC" },
    //         { name: "Hải An", code: "HA" },
    //         { name: "Kiến An", code: "KA" },
    //         { name: "Đồ Sơn", code: "DS" }
    //     ]
    // },
    // {
    //     name: "Cần Thơ",
    //     code: "CT",
    //     districts: [
    //         { name: "Ninh Kiều", code: "NK" },
    //         { name: "Bình Thủy", code: "BT" },
    //         { name: "Cái Răng", code: "CR" },
    //         { name: "Ô Môn", code: "OM" },
    //         { name: "Thốt Nốt", code: "TN" }
    //     ]
    // },
    // {
    //     name: "An Giang",
    //     code: "AG",
    //     districts: [
    //         { name: "Long Xuyên", code: "LX" },
    //         { name: "Châu Đốc", code: "CD" },
    //         { name: "Tân Châu", code: "TC" },
    //         { name: "An Phú", code: "AP" },
    //         { name: "Châu Phú", code: "CP" },
    //         { name: "Châu Thành", code: "CT" },
    //         { name: "Chợ Mới", code: "CM" },
    //         { name: "Phú Tân", code: "PT" },
    //         { name: "Thoại Sơn", code: "TS" },
    //         { name: "Tịnh Biên", code: "TB" },
    //         { name: "Tri Tôn", code: "TT" }
    //     ]
    // },
    // {
    //     name: "Bà Rịa - Vũng Tàu",
    //     code: "BRV",
    //     districts: [
    //         { name: "Vũng Tàu", code: "VT" },
    //         { name: "Bà Rịa", code: "BR" },
    //         { name: "Châu Đức", code: "CD" },
    //         { name: "Côn Đảo", code: "CD" },
    //         { name: "Đất Đỏ", code: "DD" },
    //         { name: "Long Điền", code: "LD" },
    //         { name: "Xuyên Mộc", code: "XM" }
    //     ]
    // },
    // {
    //     name: "Bắc Giang",
    //     code: "BG",
    //     districts: [
    //         { name: "TP Bắc Giang", code: "BG" },
    //         { name: "Hiệp Hòa", code: "HH" },
    //         { name: "Lạng Giang", code: "LG" },
    //         { name: "Lục Nam", code: "LN" },
    //         { name: "Lục Ngạn", code: "LNG" },
    //         { name: "Sơn Động", code: "SD" },
    //         { name: "Tân Yên", code: "TY" },
    //         { name: "Việt Yên", code: "VY" },
    //         { name: "Yên Dũng", code: "YD" },
    //         { name: "Yên Thế", code: "YT" }
    //     ]
    // },
    // {
    //     name: "Bắc Kạn",
    //     code: "BK",
    //     districts: [
    //         { name: "TP Bắc Kạn", code: "BK" },
    //         { name: "Ba Bể", code: "BB" },
    //         { name: "Bạch Thông", code: "BT" },
    //         { name: "Chợ Đồn", code: "CD" },
    //         { name: "Chợ Mới", code: "CM" },
    //         { name: "Na Rì", code: "NR" },
    //         { name: "Ngân Sơn", code: "NS" },
    //         { name: "Pác Nặm", code: "PN" }
    //     ]
    // },
    // {
    //     name: "Bạc Liêu",
    //     code: "BL",
    //     districts: [
    //         { name: "TP Bạc Liêu", code: "BL" },
    //         { name: "Đông Hải", code: "DH" },
    //         { name: "Giá Rai", code: "GR" },
    //         { name: "Hòa Bình", code: "HB" },
    //         { name: "Hồng Dân", code: "HD" },
    //         { name: "Phước Long", code: "PL" },
    //         { name: "Vĩnh Lợi", code: "VL" }
    //     ]
    // },
    // {
    //     name: "Bắc Ninh",
    //     code: "BN",
    //     districts: [
    //         { name: "TP Bắc Ninh", code: "BN" },
    //         { name: "Gia Bình", code: "GB" },
    //         { name: "Lương Tài", code: "LT" },
    //         { name: "Quế Võ", code: "QV" },
    //         { name: "Thuận Thành", code: "TT" },
    //         { name: "Tiên Du", code: "TD" },
    //         { name: "Từ Sơn", code: "TS" },
    //         { name: "Yên Phong", code: "YP" }
    //     ]
    // },
    // {
    //     name: "Bến Tre",
    //     code: "BTR",
    //     districts: [
    //         { name: "TP Bến Tre", code: "BT" },
    //         { name: "Ba Tri", code: "BT" },
    //         { name: "Bình Đại", code: "BD" },
    //         { name: "Châu Thành", code: "CT" },
    //         { name: "Chợ Lách", code: "CL" },
    //         { name: "Giồng Trôm", code: "GT" },
    //         { name: "Mỏ Cày Bắc", code: "MCB" },
    //         { name: "Mỏ Cày Nam", code: "MCN" },
    //         { name: "Thạnh Phú", code: "TP" }
    //     ]
    // },
    // {
    //     name: "Bình Định",
    //     code: "BD",
    //     districts: [
    //         { name: "Quy Nhơn", code: "QN" },
    //         { name: "An Lão", code: "AL" },
    //         { name: "An Nhơn", code: "AN" },
    //         { name: "Hoài Ân", code: "HA" },
    //         { name: "Hoài Nhơn", code: "HN" },
    //         { name: "Phù Cát", code: "PC" },
    //         { name: "Phù Mỹ", code: "PM" },
    //         { name: "Tây Sơn", code: "TS" },
    //         { name: "Tuy Phước", code: "TP" },
    //         { name: "Vân Canh", code: "VC" },
    //         { name: "Vĩnh Thạnh", code: "VT" }
    //     ]
    // },
    // {
    //     name: "Bình Dương",
    //     code: "BDG",
    //     districts: [
    //         { name: "Thủ Dầu Một", code: "TDM" },
    //         { name: "Bắc Tân Uyên", code: "BTU" },
    //         { name: "Bàu Bàng", code: "BB" },
    //         { name: "Bến Cát", code: "BC" },
    //         { name: "Dầu Tiếng", code: "DT" },
    //         { name: "Dĩ An", code: "DA" },
    //         { name: "Phú Giáo", code: "PG" },
    //         { name: "Tân Uyên", code: "TU" },
    //         { name: "Thuận An", code: "TA" }
    //     ]
    // },
    // {
    //     name: "Bình Phước",
    //     code: "BP",
    //     districts: [
    //         { name: "Đồng Xoài", code: "DX" },
    //         { name: "Bình Long", code: "BL" },
    //         { name: "Phước Long", code: "PL" },
    //         { name: "Bù Đăng", code: "BD" },
    //         { name: "Bù Đốp", code: "BDP" },
    //         { name: "Bù Gia Mập", code: "BGM" },
    //         { name: "Chơn Thành", code: "CT" },
    //         { name: "Đồng Phú", code: "DP" },
    //         { name: "Hớn Quản", code: "HQ" },
    //         { name: "Lộc Ninh", code: "LN" },
    //         { name: "Phú Riềng", code: "PR" }
    //     ]
    // }
]; 