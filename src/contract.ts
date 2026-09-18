import { NearBindgen, near, call, view, UnorderedMap, LookupMap, assert } from 'near-sdk-js';

// Define the NFT structure
class NFT {
    id: string;
    owner: string;
    metadata: string;

    constructor(id: string, owner: string, metadata: string) {
        this.id = id;
        this.owner = owner;
        this.metadata = metadata;
    }
}

@NearBindgen({})
export class NFTContract {
    owner_id: string;
    tokens: UnorderedMap<NFT>;

    constructor() {
        this.owner_id = near.predecessorAccountId();
        this.tokens = new UnorderedMap<NFT>('t');
    }

    @call({})
    mint_nft({ id, metadata }: { id: string, metadata: string }): void {
        assert(near.predecessorAccountId() === this.owner_id, "Only the owner can mint");
        assert(!this.tokens.get(id), "Token already exists");
        
        const nft = new NFT(id, near.predecessorAccountId(), metadata);
        this.tokens.set(id, nft);
        near.log(`Minted NFT: ${id}`);
    }

    @view({})
    get_nft({ id }: { id: string }): NFT | null {
        return this.tokens.get(id);
    }

    @view({})
    get_all_nfts(): NFT[] {
        const tokens: NFT[] = [];
        for (const key of this.tokens.keys({ start: 0, limit: 100 })) {
            tokens.push(this.tokens.get(key)!);
        }
        return tokens;
    }
}
