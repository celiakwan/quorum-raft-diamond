const Diamond = artifacts.require('Diamond');

module.exports = async deployer => {
  deployer.deploy(Diamond, {
    privateFor: [
      'PuVWL5epvJVyJx+IKlkKhFn43aYwi7Z4h5Av4bRcpy0=',
      'piVBvmX3ZC0/MgreH2M/SPXVja9RGH/5YPY8ITkd1QI=',
      // 'TzxGKiE8bQqX4PKmrJPOGBN69PiifUq83BixAXuaUGI='
    ]
  });
};
