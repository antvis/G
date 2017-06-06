module.exports = (webpackConfig) => {
  Object.assign(webpackConfig.output, {
    library: 'G',
    libraryTarget: 'var'
    // umdNamedDefine: true,
  })
  return webpackConfig
}
