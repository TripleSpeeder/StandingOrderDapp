import React, {Component} from 'react';

class ContractForm extends Component {

    constructor(props) {
        super(props);
        this.state = {
            receiver: '',
            rate: '',
            period: '',
            label: '',
        };

        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleInputChange(event) {
        const target = event.target;
        const name = target.name;
        const value = target.value;
        this.setState({
            [name]: value
        });
    }

    handleSubmit(event) {
        // add a new entry to outgoing contracts
        var order = {
                    label: this.state.label,
                    receiver: this.state.receiver,
                    rate: parseInt(this.state.rate),
                    period: parseInt(this.state.period),
                    owner_funds: 123,
                    funded_until: "unknown"
        }
        console.log(order);
        // Notify parent about new order
        this.props.onNewOutgoingOrder(order);
        event.preventDefault();
    }

    render() {
        return (
            <form onSubmit={this.handleSubmit}>
                <label>
                    Label:
                    <input
                        name="label"
                        type="text"
                        value={this.state.label}
                        onChange={this.handleInputChange}/>
                </label>
                <br />
                <label>
                    Receiver:
                    <input
                        name="receiver"
                        type="text"
                        value={this.state.receiver}
                        onChange={this.handleInputChange}/>
                </label>
                <br />
                <label>
                    Rate:
                    <input
                        name="rate"
                        type="number"
                        value={this.state.rate}
                        onChange={this.handleInputChange}/>
                </label>
                <br />
                <label>
                    period:
                    <input
                        name="period"
                        type="number"
                        value={this.state.period}
                        onChange={this.handleInputChange}/>
                </label>
                <input type="submit" value="Submit"/>
            </form>
        );
    }
}

export default ContractForm