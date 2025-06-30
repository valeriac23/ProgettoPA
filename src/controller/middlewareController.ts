import {User} from '../models/models';
import { Sequelize } from 'sequelize';
import { Op } from 'sequelize';
/*
export async function getRemainingTokens(email:any, checkTokens: boolean = false): Promise<number> {
    if (!checkTokens) {
        const user = await User.findOne({
            attributes: ['residual_tokens'],
            where: {
                email:email,
                residual_tokens: {[Op.gt]: 0}
            
            }
        });
        if (user != null) {
            const tokens = user?.getDataValue('residual_tokens');
            return tokens as number;
        }
        return 0;
    }
    else {
        const user = await User.findOne({
            attributes: ['residual_tokens'],
            where: {
                email: email
            }
        });
        const tokens: number = parseInt(user?.getDataValue('residual_tokens'));
        return tokens;
    }
}*/

export async function getRemainingTokens(email: string, checkTokens: boolean = false): Promise<number> {
  const whereClause = checkTokens
    ? { email }
    : { email, residual_tokens: { [Op.gt]: 0 } };

  const user = await User.findOne({
    attributes: ['residual_tokens'],
    where: whereClause
  });

  return user?.getDataValue('residual_tokens') ?? 0;
}


///DA TOGLIERE 