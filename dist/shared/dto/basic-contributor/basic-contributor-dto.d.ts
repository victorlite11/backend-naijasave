export declare class BasicContributorDto {
    _id?: string;
    name: string;
    phoneNumber: string;
    imageUrl?: string;
    status?: "active" | "inactive" | "";
}
export declare class BasicContributorOverseerModel extends BasicContributorDto {
    username?: string;
    identity?: "admin" | "contributor";
}
