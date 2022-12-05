import { AuthDto } from 'src/shared/dto/auth/auth-dto';
import { IAuthResult } from 'src/shared/interface/shared-interfaces';
import { AuthService } from 'src/shared/services/auth/auth.service';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    authenticateContributor(authCredential: AuthDto): Promise<IAuthResult>;
    authenticateAdmin(authCredential: AuthDto): Promise<IAuthResult>;
    private checkRequiredAuthData;
}
