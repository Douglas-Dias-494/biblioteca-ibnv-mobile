const { getConnection } = require('../config/database');
const oracledb = require('oracledb')

async function findUserByEmail(email) {
  const conn = await getConnection();

  const result = await conn.execute(
    `SELECT ID, NOME, EMAIL, SENHA_HASH, ATIVO, ROLE FROM USERS WHERE EMAIL = :email AND ATIVO = 1`,
    [email],
    { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );

  await conn.close();
  return result.rows[0];
}

module.exports = { findUserByEmail };
