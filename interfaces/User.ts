namespace Backstage2.Models {
    export interface User extends BaseEntity {
        role: Role;
        memberStatus: MemberStatus;
        nameTag: string;
        phoneNumber: string;
        slackId: string;
    }
}