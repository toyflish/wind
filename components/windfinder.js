/* eslint-disable @next/next/no-sync-scripts */
import Head from 'next/head'
export default function Windfinder({url}) {
  return (
    <>
      <Head>
        <script type="module" src="https://unpkg.com/x-frame-bypass"></script>
      </Head>
      <iframe class="w-full" style={{height: '80vh'}} is="x-frame-bypass" src={url}></iframe>
    </>
  )
}