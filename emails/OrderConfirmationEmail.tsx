import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Row,
  Section,
  Text,
} from "react-email";

export type OrderConfirmationItem = {
  title: string;
  sku?: string;
  quantity: number;
  unitPriceNzd: number;
  lineTotalNzd: number;
};

export type OrderConfirmationEmailProps = {
  orderNumber: string;
  customerName: string;
  orderDate: string;
  items: OrderConfirmationItem[];
  subtotalNzd: number;
  shippingNzd: number;
  taxNzd: number;
  totalNzd: number;
  shippingAddress: string[];
  orderUrl: string;
};

const money = (value: number) => new Intl.NumberFormat("en-NZ", {
  style: "currency",
  currency: "NZD",
  minimumFractionDigits: 2,
}).format(value);

export function OrderConfirmationEmail({
  orderNumber,
  customerName,
  orderDate,
  items,
  subtotalNzd,
  shippingNzd,
  taxNzd,
  totalNzd,
  shippingAddress,
  orderUrl,
}: OrderConfirmationEmailProps) {
  const preview = `Order #${orderNumber} confirmed — payment received`;

  return <Html lang="en" dir="ltr">
    <Head><title>{preview}</title></Head>
    <Body style={styles.body}>
      <Preview>{preview}</Preview>
      <Container lang="en" dir="ltr" style={styles.container}>
        <Section style={styles.brandBar}>
          <Text style={styles.brand}><span style={styles.brandRed}>CVT</span>Bearings</Text>
          <Text style={styles.tagline}>RIGHT PARTS. RIGHT PEOPLE.</Text>
        </Section>

        <Section style={styles.content}>
          <Text style={styles.eyebrow}>ORDER CONFIRMATION</Text>
          <Heading as="h1" style={styles.heading}>Thanks for your order</Heading>
          <Text style={styles.intro}>Hi {customerName || "there"}, we&apos;ve received your payment and are preparing your CVT Bearings order.</Text>

          <Section style={styles.orderBox}>
            <Row>
              <Column style={styles.orderDetailColumn}>
                <Text style={styles.orderLabel}>ORDER NUMBER</Text>
                <Text style={styles.orderValue}>#{orderNumber}</Text>
              </Column>
              <Column style={styles.orderDetailColumn}>
                <Text style={styles.orderLabel}>ORDER DATE</Text>
                <Text style={styles.orderValue}>{orderDate}</Text>
              </Column>
            </Row>
          </Section>

          <Heading as="h2" style={styles.sectionHeading}>Your order</Heading>
          <Section style={styles.items}>
            {items.map((item, index) => <Section key={`${item.title}-${index}`} style={styles.item}>
              <Row>
                <Column style={styles.itemDescription}>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  {item.sku && <Text style={styles.itemMeta}>SKU: {item.sku}</Text>}
                  <Text style={styles.itemMeta}>Quantity {item.quantity} × {money(item.unitPriceNzd)}</Text>
                </Column>
                <Column style={styles.itemPrice}><Text style={styles.itemTotal}>{money(item.lineTotalNzd)}</Text></Column>
              </Row>
            </Section>)}
          </Section>

          <Section style={styles.totals}>
            <Row><Column><Text style={styles.totalLabel}>Subtotal</Text></Column><Column style={styles.totalValueColumn}><Text style={styles.totalValue}>{money(subtotalNzd)}</Text></Column></Row>
            <Row><Column><Text style={styles.totalLabel}>Delivery</Text></Column><Column style={styles.totalValueColumn}><Text style={styles.totalValue}>{shippingNzd ? money(shippingNzd) : "Free"}</Text></Column></Row>
            <Row><Column><Text style={styles.totalLabel}>Includes GST</Text></Column><Column style={styles.totalValueColumn}><Text style={styles.totalValue}>{money(taxNzd)}</Text></Column></Row>
            <Hr style={styles.rule}/>
            <Row><Column><Text style={styles.grandTotalLabel}>Total (NZD)</Text></Column><Column style={styles.totalValueColumn}><Text style={styles.grandTotal}>{money(totalNzd)}</Text></Column></Row>
          </Section>

          {shippingAddress.length > 0 && <>
            <Heading as="h2" style={styles.sectionHeading}>Delivery address</Heading>
            <Section style={styles.addressBox}>
              {shippingAddress.map((line) => <Text key={line} style={styles.addressLine}>{line}</Text>)}
            </Section>
          </>}

          <Button href={orderUrl} style={styles.button}>View your order</Button>
          <Text style={styles.help}>Questions about your order? Reply to this email or call 0800 288 695 and our team will help.</Text>
          <Hr style={styles.rule}/>
          <Text style={styles.footer}>This is a transactional confirmation for your CVT Bearings purchase. Please keep it for your records.</Text>
        </Section>
      </Container>
    </Body>
  </Html>;
}

const styles = {
  body: { margin: 0, padding: "32px 12px", backgroundColor: "#f2f2f2", fontFamily: "Arial, sans-serif", color: "#111111" },
  container: { maxWidth: "620px", margin: "0 auto", overflow: "hidden", backgroundColor: "#ffffff", border: "1px solid #dedede" },
  brandBar: { padding: "22px 28px 18px", borderTop: "5px solid #ee3124", borderBottom: "1px solid #eeeeee" },
  brand: { margin: 0, fontFamily: "Georgia, serif", fontSize: "28px", fontWeight: 700, lineHeight: "32px" },
  brandRed: { color: "#ee3124" },
  tagline: { margin: "3px 0 0", color: "#768600", fontSize: "9px", fontWeight: 700, letterSpacing: "0.7px" },
  content: { padding: "28px" },
  eyebrow: { margin: "0 0 8px", color: "#a8271f", fontSize: "11px", fontWeight: 700, letterSpacing: "1.1px" },
  heading: { margin: "0 0 12px", color: "#111111", fontSize: "30px", lineHeight: "36px" },
  intro: { margin: "0 0 24px", color: "#4f5866", fontSize: "16px", lineHeight: "25px" },
  orderBox: { marginBottom: "28px", padding: "16px 18px", borderLeft: "4px solid #ee3124", backgroundColor: "#f7f7f7" },
  orderDetailColumn: { width: "50%", verticalAlign: "top" },
  orderLabel: { margin: "0 0 5px", color: "#a8271f", fontSize: "10px", fontWeight: 700, letterSpacing: "1px" },
  orderValue: { margin: 0, color: "#111111", fontSize: "15px", fontWeight: 700, lineHeight: "22px" },
  sectionHeading: { margin: "26px 0 12px", color: "#111111", fontSize: "20px", lineHeight: "26px" },
  items: { borderTop: "1px solid #e4e4e4" },
  item: { padding: "16px 0", borderBottom: "1px solid #e4e4e4" },
  itemDescription: { paddingRight: "16px", verticalAlign: "top" },
  itemPrice: { width: "100px", textAlign: "right" as const, verticalAlign: "top" },
  itemTitle: { margin: "0 0 5px", color: "#111111", fontSize: "15px", fontWeight: 700, lineHeight: "22px" },
  itemMeta: { margin: "2px 0", color: "#697184", fontSize: "12px", lineHeight: "18px" },
  itemTotal: { margin: 0, color: "#111111", fontSize: "15px", fontWeight: 700, lineHeight: "22px" },
  totals: { marginTop: "22px" },
  totalLabel: { margin: "5px 0", color: "#697184", fontSize: "13px", lineHeight: "20px" },
  totalValueColumn: { textAlign: "right" as const },
  totalValue: { margin: "5px 0", color: "#111111", fontSize: "13px", lineHeight: "20px" },
  grandTotalLabel: { margin: "6px 0", color: "#111111", fontSize: "17px", fontWeight: 700, lineHeight: "24px" },
  grandTotal: { margin: "6px 0", color: "#ee3124", fontSize: "19px", fontWeight: 700, lineHeight: "24px" },
  addressBox: { padding: "14px 18px", backgroundColor: "#f7f7f7" },
  addressLine: { margin: "2px 0", color: "#333333", fontSize: "13px", lineHeight: "20px" },
  button: { boxSizing: "border-box" as const, display: "block", minHeight: "44px", margin: "28px 0 20px", padding: "13px 22px", borderRadius: "5px", backgroundColor: "#ee3124", color: "#ffffff", fontSize: "14px", fontWeight: 700, textAlign: "center" as const, textDecoration: "none", textTransform: "uppercase" as const },
  help: { margin: 0, color: "#4f5866", fontSize: "13px", lineHeight: "21px" },
  rule: { margin: "20px 0", border: "0", borderTop: "1px solid #dedede" },
  footer: { margin: 0, color: "#697184", fontSize: "11px", lineHeight: "18px" },
};

OrderConfirmationEmail.PreviewProps = {
  orderNumber: "6F40E331",
  customerName: "Alex",
  orderDate: "30 October 2026",
  items: [
    { title: "Ball Bearing Subaru CVT", sku: "SUBCVT-B40", quantity: 1, unitPriceNzd: 89.30, lineTotalNzd: 89.30 },
    { title: "Honda CVT Ball Bearing", sku: "HCVT357214", quantity: 2, unitPriceNzd: 64.95, lineTotalNzd: 129.90 },
  ],
  subtotalNzd: 219.20,
  shippingNzd: 12,
  taxNzd: 30.16,
  totalNzd: 231.20,
  shippingAddress: ["Alex Customer", "125 State Highway 5", "Tirau 3485", "New Zealand"],
  orderUrl: "https://cvt-bearings.vercel.app/account#orders",
} satisfies OrderConfirmationEmailProps;

export default OrderConfirmationEmail;
