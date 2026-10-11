import {
  Body,
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

export type BusinessEnquiryEmailProps = {
  kind: "contact" | "quote" | "newsletter";
  name: string;
  email: string;
  phone?: string;
  service?: string;
  productTitle?: string;
  productSku?: string;
  fields: Array<{ label: string; value: string }>;
};

const kindTitle = {
  contact: "New website enquiry",
  quote: "New quote request",
  newsletter: "New newsletter signup",
} as const;

export function BusinessEnquiryEmail({ kind, name, email, phone, service, productTitle, productSku, fields }: BusinessEnquiryEmailProps) {
  const title = kindTitle[kind];
  const preview = productTitle ? `${title} for ${productTitle}` : `${title} from ${name || email}`;

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
          <Text style={styles.eyebrow}>{kind === "quote" ? "PRODUCT QUOTE" : kind === "newsletter" ? "NEWSLETTER" : "CUSTOMER ENQUIRY"}</Text>
          <Heading as="h1" style={styles.heading}>{title}</Heading>
          <Text style={styles.intro}>A customer submitted this through the CVT Bearings website. Reply directly to this email to contact them.</Text>
          {productTitle && <Section style={styles.productBox}>
            <Text style={styles.productLabel}>PRODUCT</Text>
            <Text style={styles.productTitle}>{productTitle}</Text>
            {productSku && <Text style={styles.productSku}>Item no. {productSku}</Text>}
          </Section>}
          <Section style={styles.details}>
            <Row><Column style={styles.label}>Name</Column><Column style={styles.value}>{name || "Not supplied"}</Column></Row>
            <Row><Column style={styles.label}>Email</Column><Column style={styles.value}>{email}</Column></Row>
            {phone && <Row><Column style={styles.label}>Phone</Column><Column style={styles.value}>{phone}</Column></Row>}
            {service && <Row><Column style={styles.label}>Enquiry type</Column><Column style={styles.value}>{service}</Column></Row>}
            {fields.filter((field) => field.value).map((field) => <Row key={field.label}>
              <Column style={styles.label}>{field.label}</Column>
              <Column style={styles.value}>{field.value}</Column>
            </Row>)}
          </Section>
          <Hr style={styles.rule}/>
          <Text style={styles.footer}>Sent securely from the CVT Bearings website. This is a transactional business notification.</Text>
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
  intro: { margin: "0 0 24px", color: "#4f5866", fontSize: "15px", lineHeight: "24px" },
  productBox: { marginBottom: "22px", padding: "16px 18px", borderLeft: "4px solid #ee3124", backgroundColor: "#f7f7f7" },
  productLabel: { margin: "0 0 5px", color: "#a8271f", fontSize: "10px", fontWeight: 700, letterSpacing: "1px" },
  productTitle: { margin: 0, color: "#111111", fontSize: "18px", fontWeight: 700, lineHeight: "25px" },
  productSku: { margin: "5px 0 0", color: "#697184", fontSize: "12px" },
  details: { borderTop: "1px solid #e4e4e4" },
  label: { width: "34%", padding: "11px 12px 11px 0", borderBottom: "1px solid #e4e4e4", color: "#697184", fontSize: "12px", verticalAlign: "top" },
  value: { padding: "11px 0", borderBottom: "1px solid #e4e4e4", color: "#111111", fontSize: "14px", lineHeight: "21px", whiteSpace: "pre-wrap" as const, verticalAlign: "top" },
  rule: { margin: "26px 0 18px", border: "0", borderTop: "1px solid #dedede" },
  footer: { margin: 0, color: "#697184", fontSize: "11px", lineHeight: "18px" },
};

BusinessEnquiryEmail.PreviewProps = {
  kind: "quote",
  name: "Alex Customer",
  email: "alex@example.com",
  phone: "+64 21 555 0123",
  service: "Product quote",
  productTitle: "Honda CVT Ball Bearing",
  productSku: "HCVT357214",
  fields: [
    { label: "Quantity", value: "2" },
    { label: "Vehicle", value: "2015 Honda Fit" },
    { label: "Transmission code", value: "GK3" },
  ],
} satisfies BusinessEnquiryEmailProps;

export default BusinessEnquiryEmail;
