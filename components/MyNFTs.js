import { useOwnedNFTs, useTotalCount } from "@thirdweb-dev/react";

const MyNFTs = ({ contract, address }) => {
  const {
    data: ownedNFTs,
    isLoadingNFT,
    errorNFT,
  } = useOwnedNFTs(contract, address);

  return (
    !isLoadingNFT &&
    ownedNFTs && (
      <div className="w-[80%] p-4">
        <h2>MyNFTs</h2>
        <div className="w-full text-center p-2">
          <span className="border p-2">{ownedNFTs.length} NFTs</span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {ownedNFTs?.map((nft, index) => (
            <div key={index} className="p-2 bg-gray-300">
              <h3 className="text-gray-800">{nft.metadata.name}</h3>
              <p className="text-gray-600">{nft.metadata.description}</p>
              <img className="w-full" src={nft.metadata.image} />
            </div>
          ))}
        </div>
      </div>
    )
  );
};

export default MyNFTs;
