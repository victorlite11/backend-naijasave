export declare class AnnouncementsDto {
    _id?: string;
    title: string;
    body: string;
    date?: string;
    auther?: string;
    category: Category;
}
export declare class Category {
    general?: boolean;
    admins?: boolean;
    investors?: boolean;
    contributors?: boolean;
    subContributors?: boolean;
    superContributors?: boolean;
}
