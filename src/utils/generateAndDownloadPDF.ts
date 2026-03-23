import { generatePDF } from 'react-native-html-to-pdf'
import Share from 'react-native-share'
import RNFS from 'react-native-fs'
import { Platform } from 'react-native'
import { showSuccessSnackbar } from './showSnackBar'

export const generateAndShareReceiptPDF = async (html: string, filename: string) => {
    const options = {
        html,
        fileName: filename,          // e.g. 'DWWP_Receipt_pay_XXXXX'
        directory: 'Documents',      // iOS: Documents, Android: internal storage
        base64: true,
    }
    try {
        const file = await generatePDF(options)

        if (!file.filePath) throw new Error('PDF generation failed')
        let finalPath = file.filePath

        if (Platform.OS === 'android') {
            const destPath = `${RNFS.DownloadDirectoryPath}/${filename}.pdf`

            await RNFS.copyFile(file.filePath, destPath)
            finalPath = destPath
        }
        showSuccessSnackbar("Receipt saved to Downloads")
        await Share.open({
            url: `file://${finalPath}`,
            type: 'application/pdf',
        })

    } catch (error) {
        console.log(error);

    }
}