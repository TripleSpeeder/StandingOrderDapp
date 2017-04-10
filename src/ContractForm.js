import React, {Component} from 'react';

class ContractForm extends Component {

    constructor(props) {
        super(props);
        this.state = {
            receiver: '',
            rate: '',
            period: '',
        };

        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleInputChange(event) {
        const target = event.target;
        const name = target.name;
        const value = target.value;
        /*
        console.log(name);
        console.log(value);
        */
        this.setState({
            [name]: value
        });
    }

    handleSubmit(event) {
        // add a new entry to outgoing contracts
        var order = {
                    receiver: this.state.receiver,
                    rate: this.state.rate,
                    period: this.state.period,
                    owner_funds: 123,
                    funded_until: "unknown"
        };
        console.log(order);
        // Notify parent about new order
        this.props.onNewOutgoingOrder(order);
        event.preventDefault();
    }

    render() {
        return (
            <form onSubmit={this.handleSubmit}>
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