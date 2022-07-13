import {
  ChainId,
  useContractMetadata,
  useNetwork,
  useActiveClaimCondition,
  useEditionDrop,
  useNFT,
  ThirdwebNftMedia,
  useNetworkMismatch,
  useAddress,
  useContract,
  useMetamask,
} from "@thirdweb-dev/react";
import { BigNumber } from "ethers";
import type { NextPage } from "next";
import { useState } from "react";
import styles from "../styles/Theme.module.css";
import { ConnectAccount } from "../components/ConnectAccount";
import ThemeToggler from "../components/ThemeToggler";
import MyNFTs from "../components/MyNFTs";

// Put Your Edition Drop Contract address from the dashboard here
const myEditionDropContractAddress =
  "0x691604da1774cc673692dfb05be9f68e9cd7a4b9";

const Home: NextPage = () => {
  const editionDrop = useEditionDrop(myEditionDropContractAddress);
  const { contract } = useContract(myEditionDropContractAddress);

  const address = useAddress();
  const connectWithMetamask = useMetamask();
  const isOnWrongNetwork = useNetworkMismatch();
  const [, switchNetwork] = useNetwork();

  // The amount the user claims, updates when they type a value into the input field.
  const [quantity, setQuantity] = useState<number>(1); // default to 1
  const [claiming, setClaiming] = useState<boolean>(false);

  // Load contract metadata
  const { data: contractMetadata } = useContractMetadata(
    myEditionDropContractAddress
  );

  const { data: nftMetadata } = useNFT(editionDrop, 0);

  // Load the active claim condition
  const { data: activeClaimCondition } = useActiveClaimCondition(
    editionDrop,
    BigNumber.from(0)
  );

  // Loading state while we fetch the metadata
  if (!editionDrop || !contractMetadata) {
    return <div className={styles.container}>Loading...</div>;
  }

  // Function to mint/claim an NFT
  async function mint() {
    // Make sure the user has their wallet connected.
    if (!address) {
      connectWithMetamask();
      return;
    }

    // Make sure the user is on the correct network (same network as your NFT Drop is).
    if (isOnWrongNetwork) {
      switchNetwork && switchNetwork(ChainId.Mumbai);
      return;
    }

    setClaiming(true);

    try {
      const minted = await editionDrop?.claim(0, quantity);
      console.log(minted);
      alert(`Successfully minted NFT${quantity > 1 ? "s" : ""}!`);
    } catch (error: any) {
      console.error(error);
      alert((error?.message as string) || "Something went wrong");
    } finally {
      setClaiming(false);
    }
  }

  return (
    <div className={styles.container}>
      <div className="flex px-8 py-4 justify-between items-center bg-gray-500 ">
        {/* Title of your NFT Collection */}
        <h1 className="text-white">{contractMetadata?.name}</h1>
        <div className="m-2 flex gap-2 justify-around items-center ">
          <ConnectAccount />
          <ThemeToggler />
        </div>
        {/* Description of your NFT Collection */}
        {/* <p className={styles.description}>{contractMetadata?.description}</p> */}
      </div>
      <div className="flex items-center flex-col justify-around p-8 w-full dark:bg-black dark:text-white">
        <div className="p-4 text-center border border-black rounded ">
          <div className="w-[300px]">
            <ThirdwebNftMedia
              // @ts-ignore
              metadata={nftMetadata?.metadata}
              className="w-full"
            />
          </div>
          <h3 className="my-6 font-bold">{nftMetadata?.metadata.name}</h3>
          <p>{nftMetadata?.metadata.description}</p>
        </div>
        <div>
          <div className="my-8 flex items-center justify-around">
            <p>Total Minted</p>
            {activeClaimCondition ? (
              <p>
                <b>{activeClaimCondition.currentMintSupply}</b>
                {" / "}
                {activeClaimCondition.maxQuantity}
              </p>
            ) : (
              <p>Loading...</p>
            )}
          </div>

          {address ? (
            <>
              <p>Quantity</p>
              <div className={styles.quantityContainer}>
                <button
                  className={`${styles.quantityControlButton}`}
                  onClick={() => setQuantity(quantity - 1)}
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <h4>{quantity}</h4>
                <button
                  className={`${styles.quantityControlButton}`}
                  onClick={() => setQuantity(quantity + 1)}
                  disabled={
                    quantity >=
                    parseInt(
                      activeClaimCondition?.quantityLimitPerTransaction || "0"
                    )
                  }
                >
                  +
                </button>
              </div>
              <button
                className={`${styles.mainButton} ${styles.spacerTop} ${styles.spacerBottom}`}
                onClick={mint}
                disabled={claiming}
              >
                {claiming ? "Minting..." : "Mint"}
              </button>
            </>
          ) : (
            <button className={styles.mainButton} onClick={connectWithMetamask}>
              Connect Wallet
            </button>
          )}
        </div>
      </div>
      <div className="mt-8">
        {address && editionDrop && (
          <MyNFTs contract={contract} address={address} />
        )}
      </div>
    </div>
  );
};

export default Home;
