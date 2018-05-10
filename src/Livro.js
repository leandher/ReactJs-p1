import React, { Component } from 'react';
import $ from 'jquery';
import InputCustomizado from './components/InputCustomizado';
import BotaoSubmitCustomizado from './components/BotaoSubmitCustomizado';
import SelectCustomizado from './components/SelectCustomizado';
import PubSub from 'pubsub-js';
import TratadorErros from './TratadorErros';

class FormularioLivro extends Component {
    constructor() {
        super();
        this.state = { titulo: '', preco: '', autorID: '' };
        this.enviaForm = this.enviaForm.bind(this);
    }

    enviaForm(evento) {
        evento.preventDefault();
        $.ajax({
            url: 'http://localhost:8080/api/livros',
            contentType: 'application/json',
            dataType: 'json',
            type: 'post',
            data: JSON.stringify({ titulo: this.state.titulo, preco: this.state.preco, autorId: this.state.autorId }),
            success: function (resposta) {
                PubSub.publish('atualiza-lista-livros', resposta);
                this.setState({ nome: '', email: '', senha: '' });
            }.bind(this),
            error: function (resposta) {
                if (resposta.status === 400) {
                    new TratadorErros().publicaErros(resposta.responseJSON);
                }
            },
            beforeSend: function () {
                PubSub.publish("limpa-erros", {});
            }
        });
    }

    salvaAlteracao(nomeInput, evento) {
        var campo = [];
        campo[nomeInput] = evento.target.value;
        this.setState({ [nomeInput]: evento.target.value });
    }

    render() {
        return (
            <div className="pure-form pure-form-aligned">
                <form className="pure-form pure-form-aligned" onSubmit={this.enviaForm} method="post">
                    <InputCustomizado id="titulo" type="text" name="titulo" value={this.state.titulo} onChange={this.salvaAlteracao.bind(this,'titulo')} label="Título" />
                    <InputCustomizado id="Preco" type="text" name="preco" value={this.state.preco} onChange={this.salvaAlteracao.bind(this,'preco')} label="Preço" />
                    <SelectCustomizado id="autorId" name="autorId" lista={this.props.autores} onChange={this.salvaAlteracao.bind(this,'autorId')} label="Autor" atributo="nome" />
                    <BotaoSubmitCustomizado label="Gravar" />
                </form>

            </div>
        );
    }
}

class TabelaLivroes extends Component {

    render() {
        return (
            <div>
                <table className="pure-table">
                    <thead>
                        <tr>
                            <th>Título</th>
                            <th>Preço</th>
                            <th>Autor</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            this.props.lista.map(function (livro) {
                                return (
                                    <tr key={livro.id}>
                                        <td>{livro.titulo}</td>
                                        <td>{livro.preco}</td>
                                        <td>{livro.autor.nome}</td>
                                    </tr>
                                );
                            })
                        }
                    </tbody>
                </table>
            </div>
        );
    }
}

export class LivroBox extends Component {
    constructor() {
        super();
        this.state = { lista: [], autores: [] };
    }

    componentWillMount() {
        $.ajax({
            url: "http://localhost:8080/api/livros",
            dataType: 'json',
            success: function (resposta) {
                this.setState({ lista: resposta });
            }.bind(this)
        });

        $.ajax({
            url: "http://localhost:8080/api/autores",
            dataType: 'json',
            success: function (resposta) {
                this.setState({ autores: resposta });
            }.bind(this)
        }
        );

        PubSub.subscribe('atualiza-lista-livros', function (topico, novaLista) {
            this.setState({ lista: novaLista });
        }.bind(this));
    }


    render() {
        return (
            <div>
                <div className="header">
                    <h1>Cadastro de Livro</h1>
                </div>
                <div className="content" id="content">
                    <FormularioLivro autores={this.state.autores} />
                    <TabelaLivroes lista={this.state.lista} />
                </div>
            </div>
        );
    }
}