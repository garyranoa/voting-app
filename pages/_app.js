import Layout from "../components/layout/Layout"
import DashboardLayout from "../components/layout/DashboardLayout"
import { MantineProvider } from "@mantine/core"
import { Analytics } from "@vercel/analytics/react"
import Head from "next/head"
import "./styles.css"
import { useRouter } from "next/router"
import { NotificationsProvider } from "@mantine/notifications"

function MyApp({ Component, pageProps }) {
  const router = useRouter()

  const isDashboard =
    router.pathname.startsWith("/dashboard") ||
    router.pathname.startsWith("/summary")

  const LayoutToUse = isDashboard ? DashboardLayout : Layout

  return (
    <MantineProvider
      withGlobalStyles
      withNormalizeCSS
      theme={{
        colorScheme: "dark",
        fontFamily: "Inter, serif",
      }}
    >
      <NotificationsProvider>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter&display=swap"
          rel="stylesheet"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@100;200;300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css"
          rel="stylesheet"
          integrity="sha384-T3c6CoIi6uLrA9TneNEoa7RxnatzjcDSCmG1MXxSR1GAsXEV/Dwwykc2MPK8M2HN"
          crossOrigin="anonymous"
        />
        <LayoutToUse>
          <Head>
            <title>Voting!</title>
            <meta name="description" content="" />
            <meta name="keywords" content="voting, game" />
            <link rel="icon" href="/favicon.ico" />
          </Head>
          <Component {...pageProps} />
          <Analytics />
        </LayoutToUse>
      </NotificationsProvider>
    </MantineProvider>
  )
}

export default MyApp
