import { generatePDF } from 'react-native-html-to-pdf'
import Share from 'react-native-share'

export const generateAndShareReceiptPDF = async (html: string, filename: string) => {
    const options = {
        html,
        fileName: filename,          // e.g. 'DWWP_Receipt_pay_XXXXX'
        directory: 'Documents',      // iOS: Documents, Android: internal storage
        base64: true,
    }

    const file = await generatePDF(options)

    if (!file.filePath) throw new Error('PDF generation failed')

    await Share.open({
        url: `file://${file.filePath}`,
        type: 'application/pdf',
        title: 'Save DWWP Receipt',
        failOnCancel: false,         // don't throw if user dismisses share sheet
    })
}