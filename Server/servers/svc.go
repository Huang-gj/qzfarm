package servers

import (
	"Server/model/project_interface"
	"gorm.io/gorm"
)

var Svc *ServiceContext

type ServiceContext struct {
	UserModel model.UserModel
}

func NewServiceContext(sqlConn *gorm.DB) {
	Svc = &ServiceContext{
		UserModel: model.NewDefaultUserModel(sqlConn),
	}
}
