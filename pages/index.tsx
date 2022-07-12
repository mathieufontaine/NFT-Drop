import {
  ChainId,
  useContractMetadata,
  useNetwork,
  useActiveClaimCondition,
  useEditionDrop,
  useNFT,
  ThirdwebNftMedia,
} from "@thirdweb-dev/react";
import { useNetworkMismatch } from "@thirdweb-dev/react";
import { useAddress, useMetamask } from "@thirdweb-dev/react";
import { BigNumber } from "ethers";
import type { NextPage } from "next";
import { useState } from "react";
import styles from "../styles/Theme.module.css";

// Put Your Edition Drop Contract address from the dashboard here
const myEditionDropContractAddress =
  "0x691604DA1774cc673692dFB05Be9F68e9cD7a4B9";

const Home: NextPage = () => {
  const editionDrop = useEditionDrop(myEditionDropContractAddress);
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

  console.log({
    contractMetadata,
    activeClaimCondition,
  });

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
      <div className={styles.infoSide}>
        {/* Title of your NFT Collection */}
        <h1>{contractMetadata?.name}</h1>
        {/* Description of your NFT Collection */}
        {/* <p className={styles.description}>{contractMetadata?.description}</p> */}
      </div>
      <div className={styles.mintInfoContainer}>
        <div className={styles.imageSide}>
          {/* Image Preview of NFTs */}
          <ThirdwebNftMedia
            // @ts-ignore
            metadata={nftMetadata?.metadata}
            className={styles.image}
          />

          {/* Amount claimed so far */}
          <div className={styles.mintCompletionArea}>
            <div className={styles.mintAreaLeft}>
              <p>Total Minted</p>
            </div>
            <div className={styles.mintAreaRight}>
              {activeClaimCondition ? (
                <p>
                  {/* Claimed supply so far */}
                  <b>{activeClaimCondition.currentMintSupply}</b>
                  {" / "}
                  {activeClaimCondition.maxQuantity}
                </p>
              ) : (
                // Show loading state if we're still loading the supply
                <p>Loading...</p>
              )}
            </div>
          </div>

          {/* Show claim button or connect wallet button */}
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
    </div>
  );
};

export default Home;
