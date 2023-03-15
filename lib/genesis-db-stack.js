const cdk = require('@aws-cdk/core');
const ec2 = require("@aws-cdk/aws-ec2");

class GenesisDbStack extends cdk.Stack {
  /**
   *
   * @param {cdk.Construct} scope
   * @param {string} id
   * @param {cdk.StackProps=} props
   */
  constructor(scope, id, props) {
    super(scope, id, props);
    /*const ami = new ec2.LookupMachineImage({
      //name: 'ubuntu/images/hvm-ssd/ubuntu-focal-20.04-amd64-server-*', //"ami-080af029940804103",
      machineImage: ec2.MachineImage.latestAmazonLinux(),
      filters: { "virtualization-type": ["hvm"] },
      owners: [props?.env?.account || ""]
    });*/
    const vpcid = this.node.tryGetContext('vpcid');
    const vpc = ec2.Vpc.fromLookup(this, 'theVPC', {
      vpcId: vpcid
    });


    const publicSg = new ec2.SecurityGroup(this, "public-sg", {
      vpc,
      securityGroupName: "pubic-sg"
    });

    publicSg.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(22),
      "allow SSH access"
    )
    
    const privateSg = ec2.SecurityGroup.fromLookup(this, "private-sg", 'sg-0c6b6ff2c94c33f07')
    privateSg.addIngressRule(
      publicSg,
      ec2.Port.tcp(5432),
      "allow Aurora Serverless Postgres access"
    )

    new ec2.Instance(this, "jump-box", {
      vpc,
      securityGroup: publicSg,
      vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T2,
        ec2.InstanceSize.MICRO
      ),
      machineImage: ec2.MachineImage.latestAmazonLinux(),
      keyName: this.node.tryGetContext("keyName")
    })
  }
}

module.exports = { GenesisDbStack }


/*ec2.MachineImage.genericLinux({
        [props?.env?.region || ""]: ami.getImage(this).imageId,
      }),*/