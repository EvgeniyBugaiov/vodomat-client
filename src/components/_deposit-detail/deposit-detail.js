import React, { Component } from 'react';

import './deposit-detail.css';

import VodomatService from '../../services/vodomat-service';
import PayService from '../../services/pay-service';

import Spinner from '../spinner';

export default class DepositDetail extends Component {

    vodomatService = new VodomatService()
    payService = new PayService()

    state = {
        depositDetail: {},
        loading: true,
        address: '',
        avtomatNumber: null
    }

    componentDidMount() {
        this.updateDeposit()
    }

    componentDidUpdate(prevProps) {
        if (prevProps.purchaseId !== this.props.purchaseId) {
            this.setState({
                loading: true
            })
            this.updateDeposit()
        }
    } 

    onDepositLoading = (depositDetail) => {
        if (!depositDetail.city) {
            this.payService
                .getPurchase(depositDetail.purchaseId)
                .then((purchase) => {
                    this.setState({
                        depositDetail,
                        loading: false,
                        address: purchase.address,
                        avtomatNumber: purchase.avtomatNumber
                    })
                })

        } else {
            this.setState({
                depositDetail,
                loading: false,
                address: `${depositDetail.street}, ${depositDetail.house}`,
                avtomatNumber: depositDetail.avtomatNumber
            })
        }
    }

    updateDeposit = () => {
        const { purchaseId } = this.props;
        if (!purchaseId) {
            return
        }
        this.vodomatService
            .getDepositByPurchaseId(purchaseId)
            .then(this.onDepositLoading)
    }

    render() {

        const { depositDetail, loading, address, avtomatNumber } = this.state;

        const spinner = this.state.loading ? <Spinner /> : null;
        const cardBody = !loading ? <CardBody depositDetail={depositDetail}
                                              address={address}
                                              avtomatNumber={avtomatNumber}
                                    /> : null

        return (
            <div className="deposit-detail">
                <div className="card">
                    <div className="card-header d-flex justify-content-between">
                        Deposit Details
                        { spinner }
                    </div>
                    { cardBody }
                </div>
            </div>
        )
    }
}

const CardBody = (props) => {

    const { city } = props.depositDetail;
    const { purchaseId, serverId, paymentGatewayId } = props.depositDetail;
    const { billAmount, price, timePaymentGateway, timeServer, gateType } = props.depositDetail;
    const { cardMask } = props.depositDetail;
    const { statusPaymentGateway, statusServer } = props.depositDetail;
    const { address, avtomatNumber } = props;

    const addressEl = city ? <span>{address} <span className="small">({city})</span></span> : <span>{ address }</span>
    const timeServerElement = timeServer ? <small>({timeServer.replace('T', ' ')})</small> : null

    let gateTypeIcon = null;
    switch (gateType) {
        case " ApplePay":
            gateTypeIcon = <i className="fab fa-apple-pay fa-lg"></i>;
            break;
        case 'GooglePay':
            gateTypeIcon = <i className="fab fa-google-pay fa-lg"></i>;
            break;
        case 'Card':
            gateTypeIcon = <i className="fas fa-credit-card"></i>;
            break;
        default:
            break;
    }

    let statusPaymentGatewayElement = <span>{statusPaymentGateway}</span>;
    switch (statusPaymentGateway) {
        case 'PAYED':
            statusPaymentGatewayElement = <span>
                                            <span className="text-success">{statusPaymentGateway}</span>
                                            &nbsp;<span className="badge badge-dark">{gateTypeIcon}</span>
                                          </span>;
            break;
        case 'REJECTED':
            statusPaymentGatewayElement = <span className="text-warning">{statusPaymentGateway}</span>;
            break;
        case 'RETURN':
            statusPaymentGatewayElement = <span className="text-danger">{statusPaymentGateway}</span>;
            break;
        default:
            break;
    }

    let statusServerElement = <span>{statusServer}</span>;
    switch (statusServer) {
        case 0:
            statusServerElement = <span className="text-warning">WAIT</span>;
            break;
        case 1:
            statusServerElement = <span className="text-success">DONE</span>;
            break;
        case 2:
            statusServerElement = <span className="text-danger">FAIL</span>;
            break;
        default:
            break;
    }

    return (
        <React.Fragment>
            <div className="card-body">
                <h6 className="card-title">{ addressEl }</h6>
                <p className="card-text text-muted">
                    <i className="card-icon fas fa-shopping-cart"></i>
                    &nbsp;{avtomatNumber}
                </p>
                <p className="card-text text-muted">
                    <i className="card-icon fas fa-clock"></i>
                    &nbsp;{timePaymentGateway}
                    &nbsp;{timeServerElement}
                </p>
            </div>
            <ul className="list-group list-group-flush">
                <li className="list-group-item">Purchase Id: {purchaseId}</li>
                <li className="list-group-item d-flex justify-content-between">
                    <span>Server Id: {serverId}</span>
                    <span>PG Id: {paymentGatewayId}</span>
                </li>
                <li className="list-group-item d-flex justify-content-between">
                    <span>Money: {billAmount}</span>
                    <span>Price: {price}</span>
                </li>
                <li className="list-group-item">Card Mask: {cardMask}</li>
                <li className="list-group-item d-flex justify-content-between">
                    <span>Status Gateway: {statusPaymentGatewayElement}</span>
                    <span>Status Server: {statusServerElement}</span>
                </li>
            </ul>
        </React.Fragment>
    )
}