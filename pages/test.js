import React from "react";

import { wrapper } from "redux/store";
import Head from "next/head";

import PageWrapper from "components/pagewrapper";

import withTranslate from "hocs/translate";

import withWallet from "hocs/wallet";
import mane from "helper/web3/manestudio";

@withTranslate
@withWallet
class ProjectList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }
    componentDidMount() {
        this.testContract();
    }

    async testContract() {
        console.group("test");

        this.mane = new mane(this.props.i18n.t, "mainnet", 288);
        console.log("this.mane.contract.address", this.mane.contract.address);
        console.log("this.mane.contract.interface", this.mane.contract.interface);
        let owner = await this.mane.contract.owner();
        console.log("this.mane.contract.owner", owner);

        let contract_address = await this.mane.contract.clubMap(288);

        console.log("this.mane.contract.map", contract_address);

        console.groupEnd();
    }

    render() {
        return (
            <PageWrapper>
                <Head>
                    <title>{"Project List"}</title>
                </Head>
                <div className="max-w-screen-xl mx-auto"></div>
            </PageWrapper>
        );
    }
}

ProjectList.getInitialProps = wrapper.getInitialPageProps(
    (store) =>
        async ({ pathname, req, res, query }) => {
            return {};
        }
);

export default ProjectList;
