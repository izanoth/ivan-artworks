'use client';

import './styles/globals.css';
import DonationBox from "./components/DonationBox";
import DonationsTable from "./components/DonationsTable";


const Donation = () => {
  return (
    <div className="container">
      <div className="row">
        <div className="col-sm-8 pe-2 pe-sm-5">
          <p className="mt-4 text-lg font-black">Why is it reasonable???</p>
          <p className="mt-4">I spent some to deploy this smart contract and receive this kind of transaction.
          </p> 
          <p>
            Although this transaction is typically handled by NEAR users with some programming knowledge, this message is directed for non-developers as well, in order to make the concepts more accessible and help the community.
          </p>
          <p>
            Between 2014 and 2022, Zanoth has been created some digital works while studying programming.
            Currently, is working on working to develop a decentralized application (aka dApp) with this material (aka non-fungible tokens, or simply NFT). This project requires time and almost
            total dedication due to its complexity.
          </p>
          <p>
            Its intend is to implement a smart contract that goes beyond the purpose of simple donations, but for now, I am facing some technical challenges.</p>
          <p>
            Like everyone else, he has financial commitments. Abandoning the project or the accumulated experience would be the only alternative to fulfill them — something that would not be fair. That’s why your contribution can make a big difference, allowing him to keep on the go in a more sustainable way.</p>
          <p>
            He consider himself an programmer and Blockchain technology&apos;s enthusiast. Now, he feel ready to move on for a more professional and less recreational level. Your support can bring him closer to achieving this goal.
          </p>
        </div>
        <div className="col-sm-4">
          <DonationBox />
        </div>
      </div>
      <div className="row col-sm-8 pt-4">
        <h4>Latest Donations</h4>
        <DonationsTable />
      </div>
    </div>
  );
}


export default Donation;
