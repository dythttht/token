import $ from 'jquery'

class Toolbar {
  constructor(ga){
    this.ga = ga
    this.initView()
  }
  initView(){
    let $bar = this.$bar = $(`
      <div id="controls">
          <select>
              <option data-p="r:4,h:4">BalancedTree</option>
              <option data-p="n:150,m0:10,M:2">BarabasiAlbert</option>
              <option data-p="n:150,p:0.05">ErdosRenyi.np</option>
              <option data-p="n:100,m:250">ErdosRenyi.nm</option>
              <option data-p="n:120,K:4,alpha:0.5">WattsStrogatz.alpha</option>
              <option data-p="n:150,K:4,beta:0.07">WattsStrogatz.beta</option>
          </select>
          <div id="params"></div>
          <div id="graph">
              <label>charge<input id="charge" type="range" min="0" value="50" max="100" /></label>
              <label>link distance<input id="dist" type="range" min="0" value="20" max="100" /></label>
          </div>
          <button id="save">Create!</button>
      </div>`).appendTo('body')

    $bar.find('select').change(this.loadPreset.bind(this))

    $bar.find('input[type=range]').off('change').on('change', () => {
      const $charge = $bar.find('#charge')
      const $dist = $bar.find('#dist')

      this.ga.redraw(+$charge.val(),+$dist.val())
    })

    $bar.find('#save').click(async () => {
      const svg = await this.ga.svg()
      const params = this.ga.parameters()
      if(this.onSave) this.onSave(svg,params)
    })

    this.loadPreset()
  }

  loadPreset(){
    const $opt = this.$bar.find('select option:selected')

    var P = this.$bar.find('#params').html('');
    $.each($opt.data('p').split(','), function(i, p) {
        p = p.split(':');
        var inp = $('<input />').val(p[1])
      		.appendTo( $('<label />').html(p[0]).appendTo(P) );
        //inp.change(this.update.bind(this));
    });

    this.update();
  }

  update(){
    const $opt = this.$bar.find('select option:selected')
    const $charge = this.$bar.find('#charge')
    const $dist = this.$bar.find('#dist')

    var args = [];
    this.$bar.find('#params input').each(function(i,el) {
      args.push(+$(el).val());
    });
    this.ga.generate($opt.html(),args)
    this.ga.render(+$charge.val(),+$dist.val())
  }
}

export default Toolbar
