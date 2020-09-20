import { HttpException } from '@nestjs/common/exceptions/http.exception';
import { NestMiddleware, HttpStatus, Injectable } from '@nestjs/common';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { UserService } from 'src/services/user.service';
import { jwtConstants } from 'src/exceptions/constants';


@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly userService: UserService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const authHeaders = req.headers.authorization;
    if (authHeaders && (authHeaders as string).split(' ')[1] === 'Bearer') {
      const token = (authHeaders as string  ).split(' ')[1];
      const decoded: any = jwt.verify(token, jwtConstants.secret);
      const user = await this.userService.getUserById(decoded._id);

      if (!user) {
        throw new HttpException('User not found.', HttpStatus.UNAUTHORIZED);
      }
      req.user = user;
      next();
    } else {
      throw new HttpException('Not authorized.', HttpStatus.UNAUTHORIZED);
    }
  }
}