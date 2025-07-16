const nodemailer = require("nodemailer")

const emailTransporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "douglas.diasesilva@gmail.com",
        pass: "ijtl dwip gdoq zbvq"
    },
})


const enviarEmailParaAdmins = async ({ titulo, autor, categoria, anoPublicacao, paginas }) => {


    const admins = "dougfuny3@gmail.com"

    const gmailOptions = {
        from: "douglas.diasesilva@gmail.com",
        to: admins,
        subject: "Solicitação de Empréstimo de livro",
        text: `Um usuário solicitou o empréstimo de um livro. Seguem os detalhes:

📖 Título: ${titulo}

✍️ Autor: ${autor}

📚 Categoria: ${categoria}

📅 Ano de Publicação: ${anoPublicacao}

📄 Páginas: ${paginas}

    Data do pedido: `
    }

    try {
        await emailTransporter.sendMail(gmailOptions)
        console.log("E-mail enviado com sucesso");
        return { success: true }
    } catch (error) {
        console.error("Erro ao enviar o email", error)
        return { success: false, error }
    }
}

module.exports = enviarEmailParaAdmins;