import React, {Component} from 'react';
import PropTypes from 'prop-types'


class RelabelForm extends Component {

    constructor(props) {
        super(props);
        this.state = {
            label: props.label,
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
        event.preventDefault();
        console.log(this.state.label);
        // Notify parent about new Label
        this.props.onRelabel(this.state.label);
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
                <input type="submit" value="Submit"/>
            </form>
        );
    }
}

RelabelForm.propTypes = {
    onRelabel: PropTypes.func.isRequired,
    label: PropTypes.string.isRequired,
}

export default RelabelForm