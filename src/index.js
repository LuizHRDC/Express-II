import express, {response} from 'express'
import cors from 'cors'
import bcrypt from 'bcrypt'
import {v4 as uuidv4} from 'uuid'

const app = express()
app.use(cors())
app.use(express.json())


const listaCarros = [
    {
        id: uuidv4(),
        modelo: 'Civic',
        marca: 'Honda',
        ano: 2014,
        cor: 'Preto',
        preco: 50000
    }
]
app.post('/veiculos', (request, response) => {
    const {modelo, marca, ano, cor, preco} = request.body
    if (!modelo || !marca || !ano || !cor || !preco) {
        return response.status(400).json({
            message: "Todos requisitos do veículo são obrigatórios."
        })
    }
    const novoCarro = {
        id: uuidv4(),
        modelo,
        marca,
        ano,
        cor,
        preco
    }
    listaCarros.push(novoCarro)
    return response.status(201).json({
        message: "Veículo cadastrado.",
        novoCarro
    })
})

app.get('/veiculos', (request, response) => {
    if (listaCarros.length === 0) {
        return response.status(404).json({
            message: 'Nenhum veículo encontrado.'
        })
    }
    const novaListaCarros = listaCarros.map(v => {
        return `ID: ${v.id} | Modelo: ${v.modelo} | Marca: ${v.marca} | Ano: ${v.ano} | Cor: ${v.cor} | Preço ${v.preco}`
    })
    return response.status(200).send(novaListaCarros.join('\n'))
})

app.get('/veiculos/marca/:marca', (request, response) => {
    const {marca} = request.params
    const carrosFiltrados = listaCarros.filter(carro => carro.marca.toLowerCase()===marca.toLowerCase())
    if (carrosFiltrados.length === 0) {
        return response.status(404).json({
            message: `Não foi possível encontrar carros com a marca: ${marca}.`
        })
    }
    const carrosPorMarca = carrosFiltrados.map(veiculo => {
        return `ID: ${veiculo.id} | Modelo: ${veiculo.modelo} | Cor: ${veiculo.cor} | Preço: ${veiculo.preco}`
    })
    return response.status(200).send(carrosPorMarca.join('\n'))
})


app.put('/veiculos/id/:id', (request, response) => {
    const { id } = request.params;
    const { cor, preco } = request.body; 
    const index = listaCarros.findIndex(carro => carro.id === id);

    if (index !== -1) {
        if (cor) {
            listaCarros[index].cor = cor;
        }
        if (preco) {
            listaCarros[index].preco = preco;
        }
        return response.status(200).json({ 
            message: 'Veículo atualizado com sucesso.', 
            veiculo: listaCarros[index]
        });
    } else {
        return response.status(404).json({ message: 'Veículo não encontrado.' });
    }
});


app.delete('/veiculos/id/:id', (request, response) => {
    const { id } = request.params;
    const index = listaCarros.findIndex(carro => carro.id === id);
    if (index !== -1) {
        listaCarros.splice(index, 1);
        return response.status(200).json({ message: 'Veículo removido.'} );
    } else {
        return response.status(404).json({ message: 'Veículo não encontrado.' });
    }
})

const listaUsuarios = []

app.post('/usuarios', async (request, response) => {
    try {
        const {nome, email, senha} = request.body
        if (!nome || !email || !senha) {
            return response.status(400).json({
                message: "Todos requisitos do usuário são obrigatórios."
            })
        }
        const senhaCriptografada = await bcrypt.hash(senha, 10)
        const novoUsuario = {
            nome,
            email,
            senha: senhaCriptografada
        }
        const usuarioExistente = listaUsuarios.find(usuario => usuario.email === email)
        if (usuarioExistente) {
            return response.status(400).json({message: 'Usuário já existe.'})
        } 
        listaUsuarios.push(novoUsuario)
        return response.status(201).json({
            message: "Usuário criado com sucesso",
            novoUsuario
        })
    } catch (error) {
        return response.status(500).json({
            message: "Erro ao criar usuário.",
            error: error.message
        });
    }
});


app.post('/login', async (request, response) => {
    try {
        const { email, senha} = request.body

        if (!email || !senha) {
            return response.status(400).json({
                message: 'Email e senha obrigatórios.'
            })
        }
        
        const usuario = listaUsuarios.find(usuario => usuario.email === email)

        if(!usuario) {
            return response.status(404).json({
                message: 'Usuário não encontrado'
            })
        }

        const compararSenha = await bcrypt.compare(senha, usuario.senha)

        if(!compararSenha) {
            return response.status(400).json({
                message: "Dados inválidos."
            })
        }

        return response.status(200).json({
            message: "Login realizado com sucesso!"
        })

    } catch (error) {
        return response.status(500).json({
            message: "Erro ao realizar login."
        })
    }
})

app.listen(3800, () => {
    console.log('Servidor funcionando na porta 3800!')
})