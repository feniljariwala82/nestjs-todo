import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Socket } from 'socket.io';
import { EnvironmentVariables } from '../../types/environment';
import { UsersService } from '../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly userService: UsersService,
    private readonly configService: ConfigService<EnvironmentVariables>,
  ) {
    super({
      jwtFromRequest: (req: Request | Socket) => {
        if ('handshake' in req) {
          // WebSocket request (Socket.IO handshake)
          const token = req.handshake.query.token as string;
          if (!token)
            throw new UnauthorizedException('Missing authentication token');
          return token;
        } else {
          // HTTP request
          return ExtractJwt.fromAuthHeaderAsBearerToken()(req as Request);
        }
      },
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  /**
   * @description validates the tokens
   * @param payload data
   */
  async validate(payload: any) {
    try {
      // fetching the user
      const user = await this.userService.findOneOrFail({
        where: { id: payload.sub, email: payload.email },
      });

      return {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
      };

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new NotFoundException('Could not find the user.');
    }
  }
}
