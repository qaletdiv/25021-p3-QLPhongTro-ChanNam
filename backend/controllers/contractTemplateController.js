const { Setting } = require("../models");

const DEFAULT_TEMPLATE = `CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
Độc lập - Tự do - Hạnh phúc

HỢP ĐỒNG THUÊ PHÒNG TRỌ

Hôm nay, ngày {{ngay_hom_nay}}, tại địa chỉ nhà trọ.

BÊN CHO THUÊ (Bên A): Chủ trọ
- Họ và tên: Chủ trọ
- Số điện thoại: {{sdt_chu_tro}}

BÊN THUÊ (Bên B):
- Họ và tên: {{ten_nguoi_thue}}
- Số CCCD: {{cccd}}
- Số điện thoại: {{so_dien_thoai}}

Hai bên thỏa thuận ký kết hợp đồng thuê phòng trọ với các điều khoản sau:

Điều 1: Thông tin phòng thuê
- Phòng số: {{ma_phong}}
- Giá thuê: {{gia_thue}} VND/tháng
- Tiền cọc: {{tien_coc}} VND

Điều 2: Thời hạn hợp đồng
- Ngày bắt đầu: {{ngay_bat_dau}}
- Ngày kết thúc: {{ngay_ket_thuc}}
- Ngày thanh toán hàng tháng: Ngày {{ngay_thu_tien}}

Điều 3: Quy định khác
- Mã số vân tay: {{ma_van_tay}}
- Người ở kèm: {{nguoi_di_kem}}

Điều 4: Hiệu lực hợp đồng
Hợp đồng có hiệu lực kể từ ngày ký.

Đại diện bên A (Ký, ghi rõ họ tên)          Đại diện bên B (Ký, ghi rõ họ tên)`;

exports.DEFAULT_TEMPLATE = DEFAULT_TEMPLATE;

exports.getTemplate = async (req, res, next) => {
    try {
        const setting = await Setting.findOne({ where: { key: 'contract_template', landlordId: req.user.id } });
        res.json({ template: setting ? setting.value : DEFAULT_TEMPLATE });
    } catch (error) {
        next(error);
    }
};

exports.saveTemplate = async (req, res, next) => {
    try {
        const { template } = req.body;
        await Setting.upsert({ key: 'contract_template', value: template, landlordId: req.user.id });
        res.json({ message: "Luu mau hop dong thanh cong" });
    } catch (error) {
        next(error);
    }
};
