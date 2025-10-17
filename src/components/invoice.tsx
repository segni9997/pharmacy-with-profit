import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useGetSaleByIdQuery } from "@/store/saleApi";
import { ToWords } from "to-words";
import "../assets/css/invoice.css";
import { convertToWords } from "react-number-to-words";

export default function InvoicePage() {
const toWords = new ToWords({
  localeCode: "en-US",
  converterOptions: {
    currency: true,
    ignoreDecimal: false,
    ignoreZeroCurrency: true,
  },
});
  const convertToBirrWords = (amount: number) => {
    const text = toWords.convert(amount, { currency: true });
    return text.replace(/dollars?/gi, "Birr").replace(/cents?/gi, "cents");
  };
  const [date, setDate] = useState("");
  // const [fromAddress] = useState(user?.username || "");
  const [fromTIN, setFromTIN] = useState("0024397833");
  const [toPhone, setToPhone] = useState("");
  const [_, setToHouseNo] = useState("");

  const [items, setItems] = useState(
    Array(10)
      .fill(null)
      .map((_, index) => ({
        id: index + 1,
        description: "",
        unit: "",
        qty: "",
        unitPrice: "",
        totalPrice: "",
      }))
  );

  const [subTotal, setSubTotal] = useState("");
  const [vat, setVat] = useState("");
  const [grandTotal, setGrandTotal] = useState("");
  const [amountInWords, setAmountInWords] = useState("");
  const [paymentMode, setPaymentMode] = useState("");
  const [preparedBy, setPreparedBy] = useState("");
  const [cashierSign, setCashierSign] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [vatRegno, setVatRegno] = useState("");
  const [__, setFno] = useState("");

  const location = useLocation();

  const saleIdFromState = location.state?.saleId;
  const { data: saleDetail } = useGetSaleByIdQuery(saleIdFromState || "", { skip: !saleIdFromState });
  useEffect(() => {
    const sale = location.state?.sale;
    const { address, vatreg, fno } = location.state || {};
    if(address) setCustomerAddress(address);
    if(vatreg) setVatRegno(vatreg);
    if(fno) setFno("");
    if (sale) {
      setDate(new Date(sale.sale_date).toLocaleDateString());
      setToPhone(sale.customer_phone || "");
      setCustomerName(sale.customer_name || "");
      setPaymentMode(sale.payment_method || "")


      const saleItems = sale.items.map((item: any, index: number) => ({
        id: index + 1,
        description: item.medicine_name,
        unit: "",
        qty: item.quantity.toString(),
        unitPrice: item.price.toString(),
        totalPrice: item.total_price.toString(),
      }));

      setItems(saleItems);

      // Calculate totals based on sale
      const subTotalValue = parseFloat(sale.base_price);
      const discountAmount = parseFloat(sale.discounted_amount);
      const totalAfterDiscount = subTotalValue - discountAmount;
      setSubTotal(totalAfterDiscount.toFixed(2));
      setVat("0.00"); // No VAT in POS
      setGrandTotal(totalAfterDiscount.toFixed(2));

      const words = convertToBirrWords(totalAfterDiscount);
      setAmountInWords(words);
      setPreparedBy(sale.discounted_by_username || "");  
    }
  }, [location.state]);

  useEffect(() => {
    if (saleDetail) {
      setDate(new Date(saleDetail.sale_date).toLocaleDateString());
      setFno("");
      setCustomerAddress(saleDetail.customer_address || saleDetail.customer_name || "");
      setToPhone(saleDetail.customer_phone || "");
      setVatRegno(saleDetail.vat_regno || "");
      setPaymentMode(saleDetail.payment_method || "")


      const saleItems = saleDetail.items.map((item: any, index: number) => ({
        id: index + 1,
        description: item.medicine_name,
        unit: "",
        qty: item.quantity.toString(),
        unitPrice: item.price.toString(),
        totalPrice: item.total_price.toString(),
      }));

      setItems(saleItems);

      // Calculate totals based on sale
      // const subTotalValue = parseFloat(saleDetail.base_price);
      const subTotalValue = Number(
        ( saleDetail?.items?.reduce(
              (acc: number, item: any) =>
                acc + (parseFloat(item.total_price) || 0),
              0
            ) || 0
        ).toFixed(2)
      );
      const discountAmount = parseFloat(saleDetail.discounted_amount);
      const totalAfterDiscount = subTotalValue - discountAmount;
      setSubTotal(totalAfterDiscount.toFixed(2));
      setVat("0.00"); // No VAT in POS
      setGrandTotal(totalAfterDiscount.toFixed(2));

      setPreparedBy(saleDetail.discounted_by_username || "");
         const words = convertToBirrWords(totalAfterDiscount);
   setAmountInWords(words);
      setPreparedBy(saleDetail.discounted_by_username || "");

    }
  }, [saleDetail]);

  useEffect(() => {
    const sub = parseFloat(subTotal) || 0;
    const vatPercent = parseFloat(vat) || 0;
    const vatAmount = sub * (vatPercent / 100);
    setGrandTotal((sub + vatAmount).toFixed(2));
    const words = convertToBirrWords(sub + vatAmount);
    setAmountInWords(words);
  }, [subTotal, vat]);

  type ItemField = "description" | "unit" | "qty" | "unitPrice" | "totalPrice";

  const handleItemChange = (index: number, field: ItemField, value: string) => {
    const newItems = [...items];
    // Type assertion to avoid 'never' type error
    (newItems[index] as any)[field] = value;

    // Auto-calculate total price
    if (field === "qty" || field === "unitPrice") {
      const qty =
        Number.parseFloat(field === "qty" ? value : newItems[index].qty) || 0;
      const unitPrice =
        Number.parseFloat(
          field === "unitPrice" ? value : newItems[index].unitPrice
        ) || 0;
      newItems[index].totalPrice = (qty * unitPrice).toFixed(2);
    }

    setItems(newItems);
    calculateTotals(newItems);
  };


  const calculateTotals = (currentItems: any[]) => {
    const sum = currentItems.reduce((acc, item) => {
      return acc + (Number.parseFloat(item.totalPrice) || 0);
    }, 0);

    setSubTotal(sum.toFixed(2));
    setVat("15.00"); // 15% VAT
    const vatAmount = sum * 0.15;
    setGrandTotal((sum + vatAmount).toFixed(2));

    // Convert grand total to words using to-words module
    setAmountInWords(convertToWords(sum + vatAmount));
  };

  const handlePrint = () => {
    window.print();
  };

  const handleClear = () => {
    if (confirm("Are you sure you want to clear all fields?")) {
      setDate("");
      setFno("");
      setCustomerAddress("");
      setToHouseNo("");
      setVatRegno("");
      setItems(
        Array(10)
          .fill(null)
          .map((_, index) => ({
            id: index + 1,
            description: "",
            unit: "",
            qty: "",
            unitPrice: "",
            totalPrice: "",
          }))
      );
      setSubTotal("");
      setVat("");
      setGrandTotal("");
      setAmountInWords("");
      setPreparedBy("");
      setCashierSign("");
    }
  };

  return (
    <div className="invoice-page">
      <div className="invoice-container">
        <div className="invoice-header">
          <div className="pharmacy-name-amharic">ቱሂም መድኃኒት ቤት</div>
          <div className="pharmacy-name-english">NATI PHARMACY</div>
          <div className="phone-number">
            <span>☎</span>
            <span>0995-969797</span>
          </div>
          <div className="header-fields flex flex-col ms-auto justify-end  items-end  ">
            <div className="field-group">
              <label>Date:</label>
              <input
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="field-group">
              <label>F.No:</label>
              <input
                type="text"
                value={"_________________"}
                onChange={(e) => setFno(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-24">
          <div className="party">
            <h4>
              From: &nbsp;
              <strong>KASU ABERHAM</strong>
            </h4>
            <div className="party-field">
              <label>Address:</label>
              <div className="flex flex-col">
                <input
                  type="text"
                  value="LIDETA W.04 H.No 303/2"
                  // onChange={(e) => setFromAddress(e.target.value)}
                  className="w-fit "
                  readOnly
                />

                {/* <span>W.04 H.No 303/2</span> */}
              </div>
            </div>

            <div className="party-field">
              <label>Supplier's TIN No.</label>
              <input
                type="text"
                value={fromTIN}
                onChange={(e) => setFromTIN(e.target.value)}
              />
            </div>
          </div>

          <div className="party">
            <h4>
              To:
              <strong>
                {saleDetail?.customer_name
                  ? saleDetail.customer_name.toUpperCase()
                  : customerName.length > 0
                  ? customerName.toUpperCase()
                  : "____________________"}
              </strong>
            </h4>
            <div className="party-field">
              <label>Address:</label>
              <input
                type="text"
                value={
                  customerAddress.length > 0
                    ? customerAddress
                    : "__________________"
                }
                onChange={(e) => setCustomerAddress(e.target.value)}
              />
              {/* <p>H.No.</p> */}
            </div>

            <div className="party-field">
              <label>Phone:</label>
              <input
                type="text"
                value={toPhone || "__________________"}
                onChange={(e) => setToPhone(e.target.value)}
              />
            </div>

            <div className="party-field">
              <label className="text-[8px]">Customer's VAT Reg.No</label>
              <input
                type="text"
                value={vatRegno || "__________________"}
                onChange={(e) => setVatRegno(e.target.value)}
              />
            </div>

            {/* <div className="party-field">
              <label>Date of Registration</label>
              <input
                type="text"
                value={toRegDate}
                onChange={(e) => setToRegDate(e.target.value)}
              />
            </div> */}
          </div>
        </div>

        <div className="invoice-title">Attachment Cash Sales Invoice</div>

        <table className="invoice-table">
          <thead>
            <tr>
              <th style={{ width: "50px" }}>S.No</th>
              <th style={{ width: "200px" }}>Description</th>
              <th style={{ width: "80px" }}>Unit</th>
              <th style={{ width: "80px" }}>Qty.</th>
              <th style={{ width: "100px" }}>Unit Price</th>
              <th style={{ width: "120px" }}>Total Price</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>
                  <input
                    type="text"
                    className="description-input"
                    value={item.description}
                    onChange={(e) =>
                      handleItemChange(index, "description", e.target.value)
                    }
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={item.unit}
                    onChange={(e) =>
                      handleItemChange(index, "unit", e.target.value)
                    }
                  />
                </td>
                <td>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={item.qty}
                    onChange={(e) =>
                      handleItemChange(index, "qty", e.target.value)
                    }
                  />
                </td>
                <td>
                  <input
                    type="number"
                    step="0.01"
                    value={item.unitPrice}
                    onChange={(e) =>
                      handleItemChange(index, "unitPrice", e.target.value)
                    }
                  />
                </td>
                <td>
                  <input type="text" value={item.totalPrice} readOnly />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="totals-section">
          <table className="totals-table">
            <tbody>
              <tr>
                <td className="label-cell">Sub-Total</td>
                <td className="value-cell">
                  <input type="text" value={subTotal} readOnly />
                </td>
              </tr>
              <tr>
                <td className="label-cell">VAT</td>
                <td className="value-cell">
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={vat}
                    onChange={(e) => setVat(e.target.value)}
                  />
                </td>
              </tr>
              <tr>
                <td className="label-cell">Grand Total</td>
                <td className="value-cell">
                  <input type="text" value={grandTotal} readOnly />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="amount-in-words">
          <label>In words:</label>
          <input
            type="text"
            value={amountInWords}
            onChange={(e) => setAmountInWords(e.target.value)}
          />
        </div>

        <div className="payment-section">
          <div className="payment-field">
            <label>Prepared by</label>
            <input
              type="text"
              value={preparedBy}
              onChange={(e) => setPreparedBy(e.target.value)}
            />
          </div>
          <div className="payment-field">
            <label>Prepared date</label>
            <input
              type="text"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="payment-field">
            <label>Method of Payment</label>:{" "}
            <strong className="text-[10px]">{paymentMode}</strong>
          </div>
          <div className="payment-field">
            <label>Cashier sign</label>
            <input
              type="text"
              value={cashierSign}
              onChange={(e) => setCashierSign(e.target.value)}
            />
          </div>
        </div>

        <div className="footer-note">
          INVALID WITHOUT FISCAL OR RECEIPT ATTACHED
        </div>

        <div className="action-buttons">
          <button className="btn btn-print" onClick={handlePrint}>
            🖨️ Print Invoice
          </button>
          <button className="btn btn-clear" onClick={handleClear}>
            🗑️ Clear Form
          </button>
        </div>
      </div>
    </div>
  );
}
