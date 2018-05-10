import React, { Component } from 'react';
import PubSub from 'pubsub-js';

export default class SelectCustomizado extends Component {
    constructor() {
        super();
        this.state = { msgErro: '' };
    }

    componentDidMount() {
        PubSub.subscribe("erro-validacao", function (topico, erro) {
            if (this.props.name === erro.field)
                this.setState({ msgErro: erro.defaultMessage });
        }.bind(this));

        PubSub.subscribe("limpa-erros", function (topico) {
            this.setState({ msgErro: '' });
        }.bind(this));
    };

    render() {
        return (
            <div className="pure-control-group">
                <label htmlFor={this.props.id}>{this.props.label}</label>
                <select id={this.props.id} name={this.props.nome} onChange={this.props.onChange}>
                    <option value="">Selecione {this.props.label}</option>
                    {
                        this.props.lista.map(function (item) {
                            return <option key={item.id} value={item.id}>{item[this.props.atributo]}</option>
                        }.bind(this))
                    }
                </select>
                <span className="erro">{this.state.msgErro}</span>
            </div>
        );
    }
}