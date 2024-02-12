import React from "react";
import {
  Page,
  Text,
  View,
  Image,
  Document,
  StyleSheet,
} from "@react-pdf/renderer";
import moment from "moment";
import _ from "lodash";

const styles = StyleSheet.create({
  body: {
    padding: 25,
  },
  header: {
    borderBottom: 1,
    padding: 5,
  },
  footer: {
    borderTop: 1,
    padding: 5,
  },
  textCompany: { fontSize: 12, fontFamily: "Helvetica" },
  textAgent: { fontSize: 12, fontFamily: "Helvetica" },
  textNoSurat: { fontSize: 15, fontFamily: "Helvetica-Bold" },
  textGlobal: { fontSize: 12, fontFamily: "Helvetica" },
  textTable: { fontSize: 7, fontFamily: "Helvetica" },
  logos: {
    height: 35,
    width: 100,
  },
});

const MyDoc = ({
  dataProduct,
  customerName,
  alamatToko,
  noSurat,
  noOrder,
  totalWeight,
  shippingDate,
  note,
}: {
  dataProduct: any[];
  customerName: string;
  alamatToko: string;
  noSurat: string;
  noOrder: string;
  shippingDate: Date;
  totalWeight: number;
  note?: string;
}) => (
  <Document>
    <Page style={styles.body}>
      <View style={styles.header} fixed>
        <Image
          style={styles.logos}
          src={"/image/logo-sahara-bogatama-mid.png"}
        />
      </View>
      <View style={{ flex: 1 }} wrap={true}>
        <View style={{ padding: 15, flexDirection: "row" }}>
          <View style={{ flexWrap: "wrap", flex: 1, gap: 2 }}>
            <Text style={styles.textCompany}>
              PT. Sahara Bogatama Indonesia
            </Text>
            <Text style={styles.textCompany}>
              Jl HM Idrus no 15a Kelurahan Jatikramat Kecamatan Jatiasih
            </Text>
            <Text style={[styles.textCompany, { marginTop: 20 }]}>
              Kota Bekasi Jawa Barat
            </Text>
            <Text style={styles.textCompany}>Indonesia</Text>
          </View>
          <View style={{ flex: 1 }} />
        </View>

        <View style={{ flexDirection: "row" }}>
          <View style={{ flex: 1 }}></View>
          <View
            style={{
              flexWrap: "wrap",
              flex: 1,
              gap: 2,
            }}
          >
            <Text
              style={[
                styles.textAgent,
                { textTransform: "uppercase", textAlign: "right" },
              ]}
            >
              {customerName},
            </Text>
            <Text style={[styles.textAgent, { textAlign: "right" }]}>
              {alamatToko}
            </Text>
          </View>
        </View>
        <View style={{ marginVertical: 10, flexDirection: "row" }}>
          <Text style={[styles.textNoSurat, { textTransform: "uppercase" }]}>
            {noSurat}
          </Text>
        </View>
        <View style={{ flexDirection: "row" }}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.textGlobal, { fontFamily: "Helvetica-Bold" }]}>
              Order:
            </Text>
            <Text style={[styles.textGlobal]}>{noOrder}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.textGlobal, { fontFamily: "Helvetica-Bold" }]}>
              Shipping Date:
            </Text>
            <Text style={[styles.textGlobal]}>
              {moment(shippingDate).format("DD/MM/YYYY HH:mm")}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.textGlobal, { fontFamily: "Helvetica-Bold" }]}>
              Total Weight:
            </Text>
            <Text style={[styles.textGlobal]}>{totalWeight} KG</Text>
          </View>
        </View>

        <View style={{ gap: 5, marginVertical: 10 }}>
          <View
            style={{
              flexDirection: "row",
              gap: 5,
              paddingVertical: 5,
              borderBottomWidth: 0.7,
              borderTopWidth: 0.7,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={[styles.textTable]}>Product</Text>
            </View>
            <View>
              <Text style={[styles.textTable]}>Qyt</Text>
            </View>
            <View>
              <Text style={[styles.textTable]}>Satuan</Text>
            </View>
          </View>

          {_.map(dataProduct, (item: any, idx: number) => {
            return (
              <View
                key={idx.toString()}
                style={{
                  flexDirection: "row",
                  gap: 5,

                  borderBottomWidth: 0.7,
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.textTable]}>{item.productName}</Text>
                </View>
                <View>
                  <Text style={[styles.textTable]}>{item.qty}</Text>
                </View>
                <View>
                  <Text style={[styles.textTable]}>{item.unit}</Text>
                </View>
              </View>
            );
          })}
        </View>

        <View style={{ flexDirection: "row", gap: 5 }}>
          <Text style={[styles.textGlobal]}>Note:</Text>
          <Text style={[styles.textGlobal]}>{note}</Text>
        </View>

        <Text style={[styles.textGlobal, { textAlign: "center" }]}>
          DISETUJUI
        </Text>

        <View
          style={{
            flexDirection: "row",
            gap: 5,
            justifyContent: "space-around",
          }}
        >
          <Text style={[styles.textGlobal]}>Gudang</Text>
          <Text style={[styles.textGlobal]}>Security</Text>
          <Text style={[styles.textGlobal]}>Delivery</Text>
          <Text style={[styles.textGlobal]}>Customer</Text>
        </View>
      </View>
      <View style={styles.footer} fixed>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-around",
          }}
        >
          <Text style={[styles.textGlobal]}>021-22107402 / 08119992180</Text>
          <Text style={[styles.textGlobal]}>office@saharabogatama.co.id</Text>
          <Text style={[styles.textGlobal]}>https://saharabogatama.co.id</Text>
        </View>
        <Text style={[styles.textGlobal, { textAlign: "center" }]}>
          NPWP: 765208616447000
        </Text>
      </View>
    </Page>
  </Document>
);

export default MyDoc;
