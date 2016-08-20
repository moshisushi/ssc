local redis = require "resty.redis"
local cjson = require "cjson"

local red = redis:new()
red:set_timeout(1000)

local ok, err = red:connect("127.0.0.1", 6379)
if not ok then
    ngx.log(ngx.ERR, "Failed to connect to local Redis: ", err)
    ngx.exit(ngx.HTTP_INTERNAL_SERVER_ERROR)
    return
end

res, err = red:srandmember("words", 300)
if err then
    ngx.log(ngx.ERR, "Failed to get random words from Redis", err)
    ngx.exit(ngx.HTTP_INTERNAL_SERVER_ERROR)
end

local resp = {}
resp.words = res

ngx.say(cjson.encode(resp))
