/**
 * Jest Environment Setup — runs BEFORE any test module is imported
 * Sets environment variables that must be present when modules are required.
 */
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret_for_automated_testing_only';
process.env.ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || '94594484f6866a6beca1bd66f6b58b8a89be576d630d916097941657f152b430';
process.env.STELLAR_SECRET_KEY = process.env.STELLAR_SECRET_KEY || 'SCZANGBA5YHTNYVVV3C7CAZMCLXPILHSE7HG3EQZIUOCB2CPLHPO7SM';
