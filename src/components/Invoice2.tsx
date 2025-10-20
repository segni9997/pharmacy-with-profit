"use client";

import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useGetSaleByIdQuery } from "@/store/saleApi";
import { ToWords } from "to-words";
import { convertToWords } from "react-number-to-words";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer, Trash2 } from "lucide-react";
import "../assets/css/invoice2.css"

export default function InvoicePage() {
  const navigate = useNavigate();
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
  const { data: saleDetail } = useGetSaleByIdQuery(saleIdFromState || "", {
    skip: !saleIdFromState,
  });
console.log("saledetail", saleDetail)
  useEffect(() => {
    const sale = location.state?.sale;
    const { address, vatreg, fno } = location.state || {};
    if (address) setCustomerAddress(address);
    if (vatreg) setVatRegno(vatreg);
    if (fno) setFno("");
    if (sale) {
      setDate(new Date(sale.sale_date).toLocaleDateString());
      setToPhone(sale.customer_phone || "");
      setCustomerName(sale.customer_name || "");
      setPaymentMode(sale.payment_method || "");

      const saleItems = sale.items.map((item: any, index: number) => ({
        id: index + 1,
        description: item.medicine_name,
        unit: "",
        qty: item.quantity.toString(),
        unitPrice: item.price.toString(),
        totalPrice: item.total_price,
      }));

      setItems(saleItems);

      const subTotalValue = Number.parseFloat(sale.base_price);
      const discountAmount = Number.parseFloat(sale.discounted_amount);
      const totalAfterDiscount = subTotalValue - discountAmount;
      setSubTotal(totalAfterDiscount.toFixed(2));
      setVat("0.00");
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
      setCustomerAddress(
        saleDetail.customer_address || saleDetail.customer_name || ""
      );
      setToPhone(saleDetail.customer_phone || "");
      setVatRegno(saleDetail.vat_regno || "");
      setPaymentMode(saleDetail.payment_method || "");

      const saleItems = saleDetail.items.map((item: any, index: number) => ({
        id: index + 1,
        description: item.medicine_name,
        unit: "",
        qty: item.quantity.toString(),
        unitPrice: item.price.toString(),
        totalPrice: item.total_price.toString(),
      }));

      setItems(saleItems);

      const subTotalValue = Number(
        (
          saleDetail?.items?.reduce(
            (acc: number, item: any) =>
              acc + (Number.parseFloat(item.total_price) || 0),
            0
          ) || 0
        ).toFixed(2)
      );
      const discountAmount = Number.parseFloat(saleDetail.discounted_amount);
      const totalAfterDiscount = subTotalValue - discountAmount;
      setSubTotal(totalAfterDiscount.toFixed(2));
      setVat("0.00");
      setGrandTotal(totalAfterDiscount.toFixed(2));

      setPreparedBy(saleDetail.discounted_by_username || "");
      const words = convertToBirrWords(totalAfterDiscount);
      setAmountInWords(words);
    }
  }, [saleDetail]);

  useEffect(() => {
    const sub = Number.parseFloat(subTotal) || 0;
    const vatPercent = Number.parseFloat(vat) || 0;
    const vatAmount = sub * (vatPercent / 100);
    setGrandTotal((sub + vatAmount).toFixed(2));
    const words = convertToBirrWords(sub + vatAmount);
    setAmountInWords(words);
  }, [subTotal, vat]);

  type ItemField = "description" | "unit" | "qty" | "unitPrice" | "totalPrice";

  const handleItemChange = (index: number, field: ItemField, value: string) => {
    const newItems = [...items];
    (newItems[index] as any)[field] = value;

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
    setVat("15.00");
    const vatAmount = sum * 0.15;
    setGrandTotal((sum + vatAmount).toFixed(2));
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
          <div>
            <div className="pharmacy-name-english">NATNAEL WENDWOSEN ABERA</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontSize: "16px",
                fontWeight: "bold",
                marginBottom: "10px",
              }}
            >
              Cash sales voucher
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-3">
          <div className="flex flex-col">
            <div
              style={{
                fontSize: "11px",
                fontWeight: "bold",
                marginBottom: "10px",
              }}
            >
              TIN: 0023715246
            </div>
            <div
              style={{
                fontSize: "11px",
                fontWeight: "bold",
                marginBottom: "10px",
              }}
            >
              VAT: 
            </div>
          </div>
          <div
            style={{
              border: "1px solid #333",
              padding: "10px",
              fontSize: "11px",
              lineHeight: "1.6",
            }}
            className="flex flex-col justify-start items-start w-full"
          >
            <div style={{ fontWeight: "bold", marginBottom: "5px" }}>
              NATNAEL WENDWOSEN ABERA
            </div>
            <div>
              Tel: 0982836752 <br /> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                   0911952444
            </div>
            <div>Fax:</div>
            <div>POBox: Web:</div>
            <div>E-Mail:</div>
          </div>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
            marginBottom: "20px",
          }}
        >
          <div className="party">
            <div style={{ marginBottom: "10px" }} className="border p-1">
              <div style={{ fontSize: "11px" }}>
                To:{saleDetail?.customer_name || "Walk-in Customer"}
              </div>
              <div style={{ fontSize: "11px" }}>TIN No:{saleDetail?.customer_phone || "00000000"}</div>
              <div style={{ fontSize: "11px" }}>Address:{saleDetail?.customer_address || "AA"}</div>
              <div style={{ fontSize: "11px" }}>Ref.</div>
            </div>
          
           
          </div>

          <div className="party border p-2">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "10px",
                fontSize: "11px",
              }}
            >
              <div>
                <div style={{ fontWeight: "bold" }}>Voucher No</div>
                <div>CSV-0000042-25</div>
              </div>
              <div>
                <div style={{ fontWeight: "bold" }}>Date</div>
                <div>{date} 12:42 PM</div>
              </div>
              <div>
                <div style={{ fontWeight: "bold" }}>Job</div>
                <div></div>
              </div>
              <div>
                <div style={{ fontWeight: "bold" }}>Store</div>
                <div></div>
              </div>
            </div>
          </div>
        </div>

        <table className="invoice-table">
          <thead>
            <tr>
              <th style={{ width: "40px" }}>SN</th>
              <th style={{ width: "80px" }}>Code</th>
              <th style={{ width: "250px" }}>Description</th>
              <th style={{ width: "60px" }}>Qty</th>
              <th style={{ width: "80px" }}>U.Amount</th>
              <th style={{ width: "80px" }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={item.id}>
                <td>{item.id}</td>
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

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "20px",
          }}
        >
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "11px", marginBottom: "10px" }}>
              <strong>Payment Method:</strong>{" "}
              <span style={{ textDecoration: "underline" }}>
                Cash ({subTotal})
              </span>
            </div>
            <div
              style={{
                fontSize: "11px",
                fontStyle: "italic",
                marginBottom: "20px",
              }}
            >
              {amountInWords}
            </div>
          </div>

          <div className="totals-section">
            <table className="totals-table">
              <tbody>
                <tr>
                  <td className="label-cell">Sub Total</td>
                  <td className="value-cell">
                    <input type="text" value={subTotal} readOnly />
                  </td>
                </tr>
                <tr>
                  <td className="label-cell">VAT(0%)</td>
                  <td className="value-cell">
                    <input type="text" value={vat} readOnly />
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
        </div>

        <div
          style={{
            marginTop: "60px",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "40px",
            fontSize: "11px",
          }}
        >
          <div>
            <div style={{ marginBottom: "30px" }}>
              <strong>By Admin On {date}</strong>
            </div>
            <div
              style={{
                borderTop: "1px solid #333",
                paddingTop: "10px",
                marginTop: "20px",
              }}
            >
              Prepare
            </div>
          </div>
          <div>
            <div
              style={{
                borderTop: "1px solid #333",
                paddingTop: "10px",
                minHeight: "40px",
              }}
            >
              Void
            </div>
          </div>
        </div>

        <div className="footer-note">
          INVALID WITHOUT FISCAL OR REFUND RECEIPT ATTACHED
        </div>
      </div>

      <div
        className="invoice-actions"
        style={{
          display: "flex",
          gap: "8px",
          justifyContent: "center",
          padding: "16px",
          flexWrap: "wrap",
        }}
      >
        <Button
          onClick={() => navigate("/pos")}
          variant="outline"
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to POS
        </Button>
        <Button onClick={handlePrint} className="gap-2">
          <Printer className="h-4 w-4" />
          Print Invoice
        </Button>
        <Button onClick={handleClear} variant="destructive" className="gap-2">
          <Trash2 className="h-4 w-4" />
          Clear All
        </Button>
      </div>
    </div>
  );
}
