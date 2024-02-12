/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
"use client";

import React, { Suspense } from "react";
import { useRouter } from "next/navigation";
import { toastMessage } from "@/app/component/toasttify";
import { Services } from "@/app/utils/services/service";
import {
  Page,
  Text,
  View,
  Image,
  Document,
  StyleSheet,
  PDFDownloadLink,
  PDFViewer,
} from "@react-pdf/renderer";
import _ from "lodash";
import SideBar from "@/app/component/sideBar";
import NavBar from "@/app/component/navBar";
import Loader from "@/app/component/loader";
import Loading from "@/app/loading";
import moment from "moment";

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

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

  return (
    <main className="dark:bg-white bg-white min-h-screen">
      <Suspense fallback={<Loading />}>
        <PDFViewer className="w-screen h-screen">
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
                  <View style={{ flexWrap: "wrap", flex: 1, gap: 2 }}>
                    <Text
                      style={[styles.textAgent, { textTransform: "uppercase" }]}
                    >
                      Sahl Mart Bekasi,
                    </Text>
                    <Text style={styles.textAgent}>
                      Jl. Raya Jatikramat No.155-74, RT.004/RW.001, Jatimekar,
                      Kec. Jatiasih, Kota Bks, Jawa Barat 17422
                    </Text>
                  </View>
                </View>
                <View style={{ marginVertical: 10, flexDirection: "row" }}>
                  <Text
                    style={[styles.textNoSurat, { textTransform: "uppercase" }]}
                  >
                    FG/OUT/01956
                  </Text>
                </View>
                <View style={{ flexDirection: "row" }}>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.textGlobal,
                        { fontFamily: "Helvetica-Bold" },
                      ]}
                    >
                      Order:
                    </Text>
                    <Text style={[styles.textGlobal]}>S12345</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.textGlobal,
                        { fontFamily: "Helvetica-Bold" },
                      ]}
                    >
                      Shipping Date:
                    </Text>
                    <Text style={[styles.textGlobal]}>
                      {moment().format("DD/MM/YYYY HH:mm")}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.textGlobal,
                        { fontFamily: "Helvetica-Bold" },
                      ]}
                    >
                      Total Weight:
                    </Text>
                    <Text style={[styles.textGlobal]}>450.1 KG</Text>
                  </View>
                </View>

                <View style={{ flexDirection: "row", gap: 5 }}>
                  <Text style={[styles.textGlobal]}>Note:</Text>
                  <Text style={[styles.textGlobal]}>PN</Text>
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

                  {_.map(
                    [
                      {
                        productName: "[DB] DAGING BURGER SAPI",
                        qyt: 10,
                        unit: "Pack",
                      },
                      {
                        productName: "[DB] DAGING BURGER SAPI",
                        qyt: 10,
                        unit: "Pack",
                      },
                      {
                        productName: "[DB] DAGING BURGER SAPI",
                        qyt: 10,
                        unit: "Pack",
                      },
                      {
                        productName: "[DB] DAGING BURGER SAPI",
                        qyt: 10,
                        unit: "Pack",
                      },
                      {
                        productName: "[DB] DAGING BURGER SAPI",
                        qyt: 10,
                        unit: "Pack",
                      },
                      {
                        productName: "[DB] DAGING BURGER SAPI",
                        qyt: 10,
                        unit: "Pack",
                      },
                      {
                        productName: "[DB] DAGING BURGER SAPI",
                        qyt: 10,
                        unit: "Pack",
                      },
                      {
                        productName: "[DB] DAGING BURGER SAPI",
                        qyt: 10,
                        unit: "Pack",
                      },
                      {
                        productName: "[DB] DAGING BURGER SAPI",
                        qyt: 10,
                        unit: "Pack",
                      },
                      {
                        productName: "[DB] DAGING BURGER SAPI",
                        qyt: 10,
                        unit: "Pack",
                      },
                      {
                        productName: "[DB] DAGING BURGER SAPI",
                        qyt: 10,
                        unit: "Pack",
                      },
                      {
                        productName: "[DB] DAGING BURGER SAPI",
                        qyt: 10,
                        unit: "Pack",
                      },
                      {
                        productName: "[DB] DAGING BURGER SAPI",
                        qyt: 10,
                        unit: "Pack",
                      },
                      {
                        productName: "[DB] DAGING BURGER SAPI",
                        qyt: 10,
                        unit: "Pack",
                      },
                      {
                        productName: "[DB] DAGING BURGER SAPI",
                        qyt: 10,
                        unit: "Pack",
                      },
                      {
                        productName: "[DB] DAGING BURGER SAPI",
                        qyt: 10,
                        unit: "Pack",
                      },
                      {
                        productName: "[DB] DAGING BURGER SAPI",
                        qyt: 10,
                        unit: "Pack",
                      },
                      {
                        productName: "[DB] DAGING BURGER SAPI",
                        qyt: 10,
                        unit: "Pack",
                      },
                      {
                        productName: "[DB] DAGING BURGER SAPI",
                        qyt: 10,
                        unit: "Pack",
                      },
                      {
                        productName: "[DB] DAGING BURGER SAPI",
                        qyt: 10,
                        unit: "Pack",
                      },
                      {
                        productName: "[DB] DAGING BURGER SAPI",
                        qyt: 10,
                        unit: "Pack",
                      },
                      {
                        productName: "[DB] DAGING BURGER SAPI",
                        qyt: 10,
                        unit: "Pack",
                      },
                      {
                        productName: "[DB] DAGING BURGER SAPI",
                        qyt: 10,
                        unit: "Pack",
                      },
                    ],
                    (item: any, idx: number) => {
                      return (
                        <View
                          style={{
                            flexDirection: "row",
                            gap: 5,

                            borderBottomWidth: 0.7,
                          }}
                        >
                          <View style={{ flex: 1 }}>
                            <Text style={[styles.textTable]}>
                              {item.productName}
                            </Text>
                          </View>
                          <View>
                            <Text style={[styles.textTable]}>{item.qyt}</Text>
                          </View>
                          <View>
                            <Text style={[styles.textTable]}>{item.unit}</Text>
                          </View>
                        </View>
                      );
                    }
                  )}
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
                  <Text style={[styles.textGlobal]}>
                    021-22107402 / 08119992180
                  </Text>
                  <Text style={[styles.textGlobal]}>
                    office@saharabogatama.co.id
                  </Text>
                  <Text style={[styles.textGlobal]}>
                    https://saharabogatama.co.id
                  </Text>
                </View>
                <Text style={[styles.textGlobal, { textAlign: "center" }]}>
                  NPWP: 765208616447000
                </Text>
              </View>
            </Page>
          </Document>
        </PDFViewer>
      </Suspense>

      <Loader active={loading} />
    </main>
  );
}
